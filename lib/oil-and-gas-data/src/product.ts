export const PRODUCT_CLASS_IDENTIFIER =
    'org.hyperledger.blockchain-carbon-accounting.oil-and-gas-product';
import { OilAndGasAssetInterface } from './oilAndGasAsset';
import { OperatorInterface } from './operator';

//import { Point } from 'geojson';

export interface ProductInterface {
    uuid: string;
    class: string;
    name: string;
    type: string;
    amount: number;
    unit: string;
    assets?: OilAndGasAssetInterface[];
    operator?: OperatorInterface;
    //operatorUuid?: string;
    country?: string;
    division_type?: string;
    division_name?: string;
    sub_division_type?: string;
    sub_division_name?: string;
    //location?: Point;
    latitude?: number;
    longitude?: number;
    year?: string;
    month?: string;
    from_date?: Date;
    thru_date?: Date;
    description?: string;
    metadata?: string;
    source?: string;
    source_date?: string;
}