import { Select, Typography } from 'antd';
import "./TokenSelect.less";
import { useState } from "react";
import { SolanaToken } from '../../constants';
import btc from '../../assets/bitcoin.png';
import sol from '../../assets/solana.png';
import eth from '../../assets/eth.png';
import ftt from '../../assets/ftt.png';
import ray from '../../assets/ray.png';
import srm from '../../assets/srm.png';

const { Option } = Select

export function TokenSelect({
	available,
	selected,
	onTokenChanged
}: {
	onTokenChanged: (old: SolanaToken, _new: SolanaToken) => void,
	available: SolanaToken[],
	selected: SolanaToken
}) {
	const [value, setValue] = useState<SolanaToken>(selected);
	const onChange = (token: SolanaToken) => {
		setValue(token);
		onTokenChanged(value, token);
	};

	return (
		<Select
			className="token-select-wrapper item-center"
			onChange={(_value: SolanaToken) => { onChange(_value) }}
			style={{ width: "400px", cursor: "pointer", borderRadius: "10px" }}
			defaultValue={value}
			bordered={false}
		>
			{
				[value, ...available].map((each: SolanaToken, key: number) => (
					<Option key={key} value={each}>
						<img src={symbolToIcon(each)} alt={each} />&nbsp;
						<Typography.Text style={{ marginLeft: "4px" }}>{each}</Typography.Text>
					</Option>
				))
			}
		</Select>
	);
}

export function symbolToIcon(symbol: SolanaToken): string {
	// console.log("symbolToIcon", symbol);
	switch (symbol) {
		case "BTC": return btc;
		case "SOL": return sol;
		case "ETH": return eth;
		case "SRM": return srm;
		case "FTT": return ftt;
		case "RAY": return ray;
	}
}
