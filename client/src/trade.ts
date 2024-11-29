import type { PropertyTile } from './map';
import type { Player } from './player';

interface ReceiveOffer {
	player: Player;
	money: number;
	property: PropertyTile[];
}

type Trade = ReceiveOffer[];

export type { Trade, ReceiveOffer };