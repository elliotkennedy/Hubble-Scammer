import React, { useState, useEffect } from "react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { Typography, Table } from "antd";
import parse from 'html-react-parser';
import { SOL_PRICE_FACTOR_DEV, STABLECOIN_DECIMALS, Token } from "../../constants";
import useEnv from "../../hooks/useEnv";
import "./Airdrop.less";
import hubbleConfig from "../../services/hubble/hubbleConfig";
import btc from '../../assets/bitcoin.png';
import eth from '../../assets/eth.png';
import ftt from '../../assets/ftt.png';
import sol from '../../assets/solana.png';
import ray from '../../assets/ray.png';
import srm from '../../assets/srm.png';
import hbb from '../../assets/hbb.png';
import usdh from '../../assets/usdh.png';
import { NativeAccount } from "../../models/account";
import { SerumMarket } from "../../models/SerumMarket";
import { BTC_MINT, ETH_MINT, FTT_MINT, SOL_MINT, RAY_MINT, SRM_MINT } from "../../utils/ids";
import { SmallButton } from '../../components/SmallButton/SmallButton';
import { collToLamports } from "../../utils/utils";
import PageTitle from "../../components/PageTitle/PageTitle";

type TokenRow = {
  key: number;
  token: Token | "ALL";
  mint: PublicKey;
  ata: string;
  amount: number;
  netValue: number;
  button: "CREATE" | "MINT"
};

// parse('<Button className="liquidatebutton">Liquidate</Button>'),

const mintAddresses: string[] = [
  BTC_MINT,
  ETH_MINT,
  FTT_MINT,
  SOL_MINT,
  RAY_MINT,
  SRM_MINT
];

const defaultRows = (env: string): TokenRow[] => [
  {
    key: 0,
    token: "USDH",
    ata: "",
    mint: new PublicKey(hubbleConfig[env].borrowing.accounts.stablecoinMint),
    amount: 0,
    netValue: 0,
    button: "CREATE",
  },
  {
    key: 1,
    token: "HBB",
    ata: "",
    mint: new PublicKey(hubbleConfig[env].borrowing.accounts.mint.HBB),
    amount: 0,
    netValue: 0,
    button: "CREATE",
  },
  {
    key: 2,
    token: "ETH",
    ata: "",
    mint: new PublicKey(hubbleConfig[env].borrowing.accounts.mint.ETH),
    amount: 0,
    netValue: 0,
    button: "CREATE",
  },
  {
    key: 3,
    token: "BTC",
    ata: "",
    mint: new PublicKey(hubbleConfig[env].borrowing.accounts.mint.BTC),
    amount: 0,
    netValue: 0,
    button: "CREATE",
  },
  {
    key: 4,
    token: "FTT",
    ata: "",
    mint: new PublicKey(hubbleConfig[env].borrowing.accounts.mint.FTT),
    amount: 0,
    netValue: 0,
    button: "CREATE",
  },
  {
    key: 5,
    token: "RAY",
    ata: "",
    mint: new PublicKey(hubbleConfig[env].borrowing.accounts.mint.RAY),
    amount: 0,
    netValue: 0,
    button: "CREATE",
  },
  {
    key: 6,
    token: "SRM",
    ata: "",
    mint: new PublicKey(hubbleConfig[env].borrowing.accounts.mint.SRM),
    amount: 0,
    netValue: 0,
    button: "CREATE",
  },
  {
    key: 7,
    token: "SOL",
    ata: "",
    mint: new PublicKey(SOL_MINT),
    amount: 0,
    netValue: 0,
    button: "CREATE",
  },
  {
    key: 8,
    token: "ALL",
    ata: "",
    mint: new PublicKey(SOL_MINT),
    amount: 0,
    netValue: 0,
    button: "CREATE",
  },
];

const Airdrop = () => {
  const dispatch = useDispatch();
  const { walletPublicKey, env } = useEnv();

  const [data, setData] = useState<TokenRow[]>(defaultRows(env));
  const [netWorth, setNetWorth] = useState<number>(0);

  const stablecoinAta = useSelector<RootStateOrAny, PublicKey | null>((state) => state.hubbleCore.stablecoinAta);
  const ethAta = useSelector<RootStateOrAny, PublicKey | null>((state) => state.hubbleCore.ethAta);
  const btcAta = useSelector<RootStateOrAny, PublicKey | null>((state) => state.hubbleCore.btcAta);
  const srmAta = useSelector<RootStateOrAny, PublicKey | null>((state) => state.hubbleCore.srmAta);
  const fttAta = useSelector<RootStateOrAny, PublicKey | null>((state) => state.hubbleCore.fttAta);
  const rayAta = useSelector<RootStateOrAny, PublicKey | null>((state) => state.hubbleCore.rayAta);
  const hbbAta = useSelector<RootStateOrAny, PublicKey | null>((state) => state.hubbleCore.hbbAta);
  const userNativeAccount = useSelector<
    RootStateOrAny,
    NativeAccount | undefined
  >((state) => state.solana.nativeAccount);

  const stablecoinBalance = useSelector<RootStateOrAny, number | null>((state) => state.hubbleCore.stablecoinBalance);
  const ethBalance = useSelector<RootStateOrAny, number | null>((state) => state.hubbleCore.ethBalance);
  const btcBalance = useSelector<RootStateOrAny, number | null>((state) => state.hubbleCore.btcBalance);
  const srmBalance = useSelector<RootStateOrAny, number | null>((state) => state.hubbleCore.srmBalance);
  const fttBalance = useSelector<RootStateOrAny, number | null>((state) => state.hubbleCore.fttBalance);
  const rayBalance = useSelector<RootStateOrAny, number | null>((state) => state.hubbleCore.rayBalance);
  const hbbBalance = useSelector<RootStateOrAny, number | null>((state) => state.hubbleCore.hbbBalance);

  const mintCounter = useSelector<RootStateOrAny, number>((state) => state.hubbleCore.mintCounter);
  const ataCounter = useSelector<RootStateOrAny, number>((state) => state.hubbleCore.ataCounter);
  const airdropCounter = useSelector<RootStateOrAny, number>((state) => state.hubbleBorrow.airdropCounter);

  const borrowingMarketStatePubkey = useSelector<RootStateOrAny, PublicKey>((state) => state.hubbleBorrow.borrowingMarketStatePubkey);

  const initialMarketOwner = useSelector<RootStateOrAny, PublicKey>((state) => state.hubbleBorrow.borrowingMarketState?.initialMarketOwner);

  const stablecoinMintAuthority = useSelector<RootStateOrAny, PublicKey>((state) => state.hubbleBorrow.stablecoinMintAuthorityPubkey);
  const hbbMintAuthority = useSelector<RootStateOrAny, PublicKey>((state) => state.hubbleBorrow.hbbMintAuthorityPubkey);

  const stablecoinMint = new PublicKey(hubbleConfig[env].borrowing.accounts.stablecoinMint);
  const hbbMint = new PublicKey(hubbleConfig[env].borrowing.accounts.mint.HBB);
  const markets = useSelector<RootStateOrAny, Record<string, SerumMarket>>(
    (state) => state.serum.markets
  );

  useEffect(() => {
    if (!walletPublicKey) {
      // reset state
      setData(defaultRows(env));
      return;
    }
    dispatch({
      type: "hubble/core/GET_TOKENS_ATA",
      payload: {
        publicKey: walletPublicKey,
        env,
      }
    })

    dispatch({
      type: "hubble/borrow/GET_BORROWING_MARKET_STATE",
      payload: {
        env,
      },
    });

    if (mintAddresses.length > 0) {
      dispatch({
        type: "serum/GET_MARKETS",
        payload: {
          mintAddresses,
        },
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletPublicKey, env]);

  useEffect(() => {
    if (!walletPublicKey) {
      return;
    }
    dispatch({
      type: "hubble/core/GET_TOKENS_ATA",
      payload: {
        publicKey: walletPublicKey,
        env,
      }
    })


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ataCounter]);

  useEffect(() => {
    if (!walletPublicKey) {
      return;
    }

    dispatch({
      type: "hubble/core/GET_ATA_BALANCE",
      payload: {
        stablecoinAta,
        ethAta,
        btcAta,
        srmAta,
        fttAta,
        rayAta,
        hbbAta,
      },
    });

    if (mintAddresses.length > 0) {
      dispatch({
        type: "serum/GET_MARKETS_ONCE",
        payload: {
          mintAddresses,
        },
      });
    }

    dispatch({
      type: "solana/GET_NATIVE_ACCOUNT",
      payload: {
        publicKey: walletPublicKey,
      },
    });

    const newData = data;
    data[0].ata = stablecoinAta ? stablecoinAta.toString() : "";
    data[1].ata = hbbAta ? hbbAta.toString() : "";
    data[2].ata = ethAta ? ethAta.toString() : "";
    data[3].ata = btcAta ? btcAta.toString() : "";
    data[4].ata = fttAta ? fttAta.toString() : "";
    data[5].ata = rayAta ? rayAta.toString() : "";
    data[6].ata = srmAta ? srmAta.toString() : "";
    data[7].ata = walletPublicKey ? walletPublicKey.toString() : "";

    data[0].button = !stablecoinAta ? "CREATE" : "MINT";
    data[1].button = !hbbAta ? "CREATE" : "MINT";
    data[2].button = !ethAta ? "CREATE" : "MINT";
    data[3].button = !btcAta ? "CREATE" : "MINT";
    data[4].button = !fttAta ? "CREATE" : "MINT";
    data[5].button = !rayAta ? "CREATE" : "MINT";
    data[6].button = !srmAta ? "CREATE" : "MINT";
    data[7].button = "MINT";

    setData(newData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    walletPublicKey,
    env,
    hbbAta,
    stablecoinAta,
    ethAta,
    btcAta,
    srmAta,
    fttAta,
    rayAta,
    // userNativeAccount,
    mintCounter,
    airdropCounter,
  ]);

  useEffect(() => {
    const btcPrice = markets[BTC_MINT]?.midPrice;
    const ethPrice = markets[ETH_MINT]?.midPrice;
    const fttPrice = markets[FTT_MINT]?.midPrice;
    const rayPrice = markets[RAY_MINT]?.midPrice;
    const srmPrice = markets[SRM_MINT]?.midPrice;
    const solPrice = markets[SOL_MINT]?.midPrice;

    const stablecoinBal = stablecoinBalance === null ? 0 : stablecoinBalance;
    const hbbBal = hbbBalance === null ? 0 : hbbBalance;
    const btcBal = btcBalance === null ? 0 : btcBalance;
    const ethBal = ethBalance === null ? 0 : ethBalance;
    const fttBal = fttBalance === null ? 0 : fttBalance;
    const rayBal = rayBalance === null ? 0 : rayBalance;
    const srmBal = srmBalance === null ? 0 : srmBalance;
    const solBal =
      userNativeAccount == null
        ? 0
        : userNativeAccount.lamports / LAMPORTS_PER_SOL;


    const newData = data;
    data[0].amount = stablecoinBal;
    data[1].amount = hbbBal;
    data[3].amount = btcBal;
    data[2].amount = ethBal;
    data[4].amount = fttBal;
    data[5].amount = rayBal;
    data[6].amount = srmBal;
    data[7].amount = solBal;

    data[0].netValue = stablecoinBal;
    data[1].netValue = hbbBal;
    data[3].netValue = btcBal * (btcPrice || 1);
    data[2].netValue = ethBal * (ethPrice || 1);
    data[4].netValue = fttBal * (fttPrice || 1);
    data[5].netValue = rayBal * (rayPrice || 1);
    data[6].netValue = srmBal * (srmPrice || 1);
    data[7].netValue = solBal * (solPrice ? solPrice * SOL_PRICE_FACTOR_DEV : 1);

    const _netWorth = data.reduce((acc: number, row: TokenRow) => acc + row.netValue, 0);

    setNetWorth(_netWorth);
    setData(newData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    stablecoinBalance,
    hbbBalance,
    ethBalance,
    btcBalance,
    fttBalance,
    srmBalance,
    rayBalance,
    userNativeAccount,
    markets,
  ]);

  const handleRequestAirdrop = (token: Token | "ALL", mint: PublicKey, ata: string) => {
    if (!walletPublicKey) {
      return;
    }
    if (token === "SOL") {
      handleRequestSolAirdrop();
    } else if (token === "USDH") {
      handleRequestUsdhAirdrop();
    } else if (token === "HBB") {
      handleRequestHbbAirdrop();
    } else if (token !== "ALL") {
      mintIntoAta(mint, token, new PublicKey(ata), 3 * LAMPORTS_PER_SOL);
    }
  };

  const handleRequestSolAirdrop = () => {
    dispatch({
      type: "solana/REQUEST_AIRDROP",
      payload: {
        publicKey: walletPublicKey,
        lamports: env === "localnet" ? 1000 * LAMPORTS_PER_SOL : LAMPORTS_PER_SOL,
        mintCounter,
        env,
        airdropCounter
      },
    });
  };

  const handleRequestUsdhAirdrop = () => {
    dispatch({
      type: "hubble/borrow/AIRDROP_USDH",
      payload: {
        amount: 100_000 * STABLECOIN_DECIMALS, // 100k -> STABLECOIN_DECIMALS is num decimals
        stablecoinAta,
        initialMarketOwner,
        borrowingMarketState: borrowingMarketStatePubkey,
        stablecoinMint,
        stablecoinMintAuthority,
        airdropCounter,
      },
    });
  };

  const handleRequestHbbAirdrop = () => {
    console.log("handleRequestHbbAirdrop");
    dispatch({
      type: "hubble/borrow/AIRDROP_HBB",
      payload: {
        amount: 100_000 * STABLECOIN_DECIMALS,
        hbbAta,
        initialMarketOwner,
        borrowingMarketState: borrowingMarketStatePubkey,
        hbbMint,
        hbbMintAuthority,
        airdropCounter,
      },
    });
  };

  const createAta = (mint: PublicKey, token: Token) => {
    if (!walletPublicKey) {
      return;
    }
    dispatch({
      type: "hubble/core/CREATE_ATA",
      payload: {
        owner: walletPublicKey,
        env,
        mint,
        token,
        ataCounter,
      },
    });
  };

  const createAllAtas = (_env: string) => {
    if (!walletPublicKey) {
      return;
    }
    dispatch({
      type: "hubble/core/CREATE_ALL_ATAS",
      payload: {
        owner: new PublicKey(walletPublicKey),
        env: _env,
        mints: [
          new PublicKey(hubbleConfig[_env].borrowing.accounts.stablecoinMint),
          new PublicKey(hubbleConfig[_env].borrowing.accounts.mint.HBB),
          new PublicKey(hubbleConfig[_env].borrowing.accounts.mint.ETH),
          new PublicKey(hubbleConfig[_env].borrowing.accounts.mint.BTC),
          new PublicKey(hubbleConfig[_env].borrowing.accounts.mint.FTT),
          new PublicKey(hubbleConfig[_env].borrowing.accounts.mint.RAY),
          new PublicKey(hubbleConfig[_env].borrowing.accounts.mint.SRM)
        ],
        ataCounter,
      },
    });
  };

  const mintAllAtas = (_env: string) => {
    if (!walletPublicKey) {
      return;
    }
    if (stablecoinAta !== null) {
      handleRequestUsdhAirdrop();
    }
    // if (hbbAta === null) { } else { handleRequestHbbAirdrop(); }
    if (ethAta !== null) {
      mintIntoAta(new PublicKey(hubbleConfig[_env].borrowing.accounts.mint.ETH), "ETH", ethAta, collToLamports(3, "ETH"));
    }
    if (btcAta !== null) {
      mintIntoAta(new PublicKey(hubbleConfig[_env].borrowing.accounts.mint.BTC), "BTC", btcAta, collToLamports(3, "BTC"));
    }
    if (fttAta !== null) {
      mintIntoAta(new PublicKey(hubbleConfig[_env].borrowing.accounts.mint.FTT), "FTT", fttAta, collToLamports(3, "FTT"));
    }
    if (rayAta !== null) {
      mintIntoAta(new PublicKey(hubbleConfig[_env].borrowing.accounts.mint.RAY), "RAY", rayAta, collToLamports(3, "RAY"));
    }
    if (srmAta !== null) {
      mintIntoAta(new PublicKey(hubbleConfig[_env].borrowing.accounts.mint.SRM), "SRM", srmAta, collToLamports(3, "SRM"));
    }
    handleRequestSolAirdrop();

  };

  const mintIntoAta = (
    mint: PublicKey,
    token: Token,
    ata: PublicKey,
    amount: number
  ) => {
    if (!walletPublicKey) {
      return;
    }
    dispatch({
      type: "hubble/core/MINT_TOKEN",
      payload: {
        owner: walletPublicKey,
        env,
        mint,
        ata,
        token,
        amount,
        walletPublicKey,
        mintCounter,
      },
    });
  };

  const columns = [
    {
      title: "Token",
      dataIndex: "token",
      render: (token: Token | "ALL") => (
        <div style={{ marginRight: "30px", float: "left" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div style={{ width: 30 }}>
              {token === "USDH" ? <img style={{ borderRadius: 50, width: "24px" }} src={usdh} alt="" /> : null}
              {token === "HBB" ? <img style={{ borderRadius: 50, width: "24px" }} src={hbb} alt="" /> : null}
              {token === "SOL" ? <img style={{ borderRadius: 50 }} src={sol} alt="" /> : null}
              {token === "BTC" ? <img style={{ borderRadius: 50 }} src={btc} alt="" /> : null}
              {token === "ETH" ? <img style={{ borderRadius: 50 }} src={eth} alt="" /> : null}
              {token === "RAY" ? <img style={{ borderRadius: 50 }} src={ray} alt="" /> : null}
              {token === "FTT" ? <img style={{ borderRadius: 50 }} src={ftt} alt="" /> : null}
              {token === "SRM" ? <img style={{ borderRadius: 50 }} src={srm} alt="" /> : null}
              {token === "ALL" ? <img style={{ borderRadius: 50 }} alt="" /> : null}
            </div >
            <Typography.Text style={{ fontSize: "12px" }}>
              {token}
            </Typography.Text>
          </div >
        </div >
      ),
    },
    {
      title: "Account (ATA)",
      dataIndex: "ata",
      render: (ata: string) => `${ata.substr(0, 5)}...${ata.substr(ata.length - 5, 5)}`,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      sorter: (a: TokenRow, b: TokenRow) => a.amount - b.amount,
      render: (amount: number, record: TokenRow) => record.token === "ALL" ? "" : `${format(amount)}`,
    },

    {
      title: "Net Value",
      dataIndex: "netValue",
      sorter: (a: TokenRow, b: TokenRow) => a.netValue - b.netValue,
      render: (netValue: number, record: TokenRow) => record.token === "ALL" ? `$${format(netWorth)}` : `$${format(netValue)}`,
    },
    {
      title: parse(''),
      dataIndex: 'button',
      width: '10%',
      render: (button: string, record: TokenRow) => (
        <div style={{ border: 0, borderStyle: "solid", width: 120, display: "flex", justifyContent: "flex-end" }}>
          {record.token === "ALL" ? <div style={{ display: "flex" }}>
            <SmallButton key="1" text="C" onClick={() => { createAllAtas(env) }} disabled={!walletPublicKey} isLoading={false} />
            &nbsp; <SmallButton key="2" text="M" onClick={() => { mintAllAtas(env) }} disabled={!walletPublicKey} isLoading={false} />
          </div> :
            button === "CREATE"
              ? <SmallButton text="Create" onClick={() => { createAta(record.mint, record.token as Token) }} disabled={!walletPublicKey} isLoading={false} />
              : <SmallButton text="Airdrop" onClick={() => handleRequestAirdrop(record.token, record.mint, record.ata)}
                isLoading={false}
                disabled={!walletPublicKey} />}
        </div>)
    }
  ];

  return (
    <div style={{
      flexGrow: 1,
      width: '100%',
      marginTop: 50,
      textAlign: "center"
    }}>
      <PageTitle
        title="Airdrop"
        description="If only things were so simple."
      />

      <Table
        columns={columns}
        dataSource={data}
        style={{ marginTop: "50px" }}
        pagination={false}
      />
    </div>
  );
};

function format(num: number): string {
  return parseFloat(num.toFixed(2))
    .toLocaleString()
    .replace(/\.([0-9])$/, ".$10");
}

export default Airdrop;
