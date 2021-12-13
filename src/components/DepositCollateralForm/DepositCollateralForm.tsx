import { Button, Form } from "antd";
import { useEffect, useState } from "react";
import "./DepositCollateralForm.less";
import { NumericInputWithMax } from "../Input/numericWithMax";
import { TokenSelect } from "../Select/TokenSelect";
import { SolanaToken, Token } from "../../constants";

const allTokens: SolanaToken[] = ["SOL", "BTC", "ETH", "FTT", "RAY", "SRM"];

export interface DepositTokenInterface {
  symbol: SolanaToken;
  availableTokens: Array<SolanaToken>;
  max: number;
  deposit: number;
}

export function DepositCollateralForm({
  collateralTokens,
  tokenBalances,
  onValuesChange,
  label,
  showEmpty,
}: DepositCollateralFormProps) {
  const [depositTokens, setDepositTokens] = useState<Array<DepositTokenInterface>>(collateralTokens);
  const [remainingTokens, setRemainingTokens] = useState<Array<SolanaToken>>([]);
  const recalculateRemainingTokens = (deposits: Array<DepositTokenInterface>) => {
    setRemainingTokens(calculateRemainingTokens(deposits));
  }

  const calculateRemainingTokens = (deposits: Array<DepositTokenInterface>): Array<SolanaToken> => {
    const depositedTokens: Array<SolanaToken> = deposits.map((depositTokenInterface) => depositTokenInterface.symbol);
    const initialAcc: Array<SolanaToken> = [];
    const availableTokens = allTokens.filter((token) => {
      // filter out those that are empty if showempty == false
      return !(showEmpty === false && tokenBalances[token] === 0);
    })
    const remaining: Array<SolanaToken> = availableTokens.reduce((acc, token) => {
      if (!depositedTokens.includes(token)) {
        acc.push(token);
      }
      return acc;
    }, initialAcc);

    return remaining;
  }

  // First time
  useEffect(() => {
    _setNewDeposits(collateralTokens, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collateralTokens]);

  const onClickAddToken = () => {

    if (remainingTokens.length === 0) {
      return;
    }

    const newToken: DepositTokenInterface = {
      symbol: remainingTokens[0],
      max: tokenBalances[remainingTokens[0]],
      deposit: 0.0,
      availableTokens: []
    };

    const newDepositTokens: Array<DepositTokenInterface> = [
      ...depositTokens,
      newToken,
    ];

    _setNewDeposits(newDepositTokens);

  };

  const onClickRemoveToken = (token: SolanaToken) => {
    if (depositTokens.length === 1) {
      return;
    }
    const newDepositTokens = depositTokens.filter(depositTokenInterface => depositTokenInterface.symbol !== token);
    _setNewDeposits(newDepositTokens);
  }

  const onNumericChangeToken = (value: string | number, token: Token) => {
    const newDepositTokens = depositTokens.map(depositTokenInterface => {
      if (depositTokenInterface.symbol === token) {
        const newValue = depositTokenInterface;
        newValue.deposit = Number(value);
        return newValue;
      }
        return depositTokenInterface;

    });
    _setNewDeposits(newDepositTokens);
  };

  const onTokenDropdownChange = (oldToken: SolanaToken, newToken: SolanaToken) => {

    const newTokenDeposit: DepositTokenInterface = {
      symbol: newToken,
      deposit: 0,
      max: tokenBalances[newToken],
      availableTokens: []
    };

    const newDepositTokens = depositTokens.map((depositTokenInterface) => {
      if (depositTokenInterface.symbol === oldToken) {
        return newTokenDeposit;
      }
        return depositTokenInterface;

    });
    _setNewDeposits(newDepositTokens);
  }


  const _setNewDeposits = (deposits: Array<DepositTokenInterface>, trigger = true) => {
    // update remaining for each
    // trigger upstream notifications
    const remaining = calculateRemainingTokens(deposits);
    const newDepositTokens = deposits.map((tokenInterface: DepositTokenInterface) => {
      return {
        availableTokens: remaining,
        symbol: tokenInterface.symbol,
        deposit: tokenInterface.deposit,
        max: tokenInterface.max
      } as DepositTokenInterface;
    });

    setDepositTokens(newDepositTokens);
    recalculateRemainingTokens(newDepositTokens);
    if (trigger) {
      onValuesChange(newDepositTokens);
    }
  }

  return (
    <Form layout="vertical">
      {depositTokens.map((each: DepositTokenInterface, key: number) => (
        <div className="numericinputwithmax-wrapper" key={key}>
          <NumericInputWithMax
            leftitem={
              <TokenSelect
                available={each.availableTokens}
                selected={each.symbol}
                onTokenChanged={onTokenDropdownChange}
              />
            }
            topic={`${label}: ${tokenBalances[each.symbol]}`}
            value={each.deposit}
            max={tokenBalances[each.symbol]}
            symbol={each.symbol}
            onRemove={() => onClickRemoveToken(each.symbol)}
            onChangeCallback={onNumericChangeToken}
          />
        </div>
      ))}
      <Button
        style={{
          marginTop: 10
        }}
        disabled={remainingTokens.length === 0}
        onClick={onClickAddToken}
        className="sample-button"
      >
        + Add collateral
      </Button>
    </Form>
    // <Form
    //     layout="vertical"
    //     form={form}
    //     onValuesChange={_onValuesChange}
    // >
    //     <Form.List name="collateralTokens" initialValue={[{ amount: '' }]}>
    //         {(fields, { add, remove }) => (
    //             <>
    //                 {fields.map(({ key, name, fieldKey, ...restField }, index) => (
    //                     <div className="collateral-token-line" key={key}>
    //                         <Form.Item
    //                             {...restField}
    //                             style={{ color: "gray" }}
    //                             name={[name]}
    //                             fieldKey={[fieldKey]}
    //                             key={`collateralTokens_${key}`}
    //                             // todo - setting initial value does not call onValuesChange - need to figure out a better way to set a default value and correctly render max input collateral value
    //                             // initialValue={selectTokens[0] ? selectTokens[0].info.address : WRAPPED_SOL_MINT.toBase58()}
    //                             initialValue={{ amount: '' }}
    //                         >
    //                             <DepositCollateralInput selectTokens={selectTokens} />
    //                         </Form.Item>
    //                         <Link style={{ flex: 0 }} disabled={fields.length === 1} onClick={() => remove(name)}><MinusCircleOutlined /></Link>
    //                     </div>
    //                 ))}
    //                 <Form.Item>
    //                     <Button
    //                         block
    //                         onClick={() => add()}
    //                         className="add-new-token"
    //                         icon={<PlusOutlined />}
    //                         disabled={fields.length === 5 || fields.length === selectTokens.length}
    //                     >
    //                         Add additional collateral
    //                     </Button>
    //                 </Form.Item>
    //             </>
    //         )}
    //     </Form.List>
    // </Form>
  )
}

interface DepositCollateralFormProps {
  collateralTokens: Array<DepositTokenInterface>,
  tokenBalances: Record<SolanaToken, number>,
  label: string,
  showEmpty: boolean,
  onValuesChange: (deposits: Array<DepositTokenInterface>) => void;
}

