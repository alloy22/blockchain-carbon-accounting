import { 
  PostgresDBService, 
  OilAndGasAsset
} from '@blockchain-carbon-accounting/data-postgres';
import { getDistance } from 'geolib';

// returns all asssets within resolution of the listed coordinate /
// resolution is in units of kilometers approx 0.008 degrees lat per km
// arc length of 1 km longitude is adjusted as approaching the polls.
export const matchAssets = async (
  latitude: number, 
  longitude: number, 
  country: string, 
  resolution: number = 1)
: Promise<OilAndGasAsset[] | undefined > => {
  // aesst repo currently only has assets listed in Canada and U.S.
  if(['United States of America',
      'United States','USA','US',
      'Canada','CAN'].includes(country.replace(/\./g,'')))
  {
    const db = (await PostgresDBService.getInstance()).getOilAndGasAssetRepo();
    // search for assets with width of resolution centered at lat/long
    resolution*=0.5; 
    try {
      //console.log('product coord: ', latitude,longitude)
      const assets: OilAndGasAsset[] = await db.selectPaginated(0,0,[
        {   
          field: 'latitude',
          fieldSuffix: 'upper',
          fieldType: 'number',
          value: (latitude+0.008*resolution),
          op: '<',
        },{
          field: 'latitude',
          fieldSuffix: 'lower',
          fieldType: 'number',
          value: (latitude-0.008*resolution),
          op: '>',           
        },{   
          field: 'longitude',
          fieldSuffix: 'upper',
          fieldType: 'number',
          value: longitude+360*resolution/(40075*Math.cos(latitude*Math.PI/180)),
          op: '<',
        },{
          field: 'longitude',
          fieldSuffix: 'lower',
          fieldType: 'number',
          value: longitude-360*resolution/(40075*Math.cos(latitude*Math.PI/180)),
          op: '>',           
        }
      ]);
      /*let distances:number[]=[];
      for (var i = 0; i < assets.length; i++) {
          const asset = assets[i];
          distances[i]= getDistance(
              {latitude,longitude},
              {latitude:asset.latitude, longitude: asset.longitude}
          )
      }
      const min = Math.min(...distances);
      const index = distances.indexOf(min);
      const asset: OilAndGasAsset = assets[index];*/
      return assets;
      //console.log(assets);

    }catch (err) {
      console.error(err)
      throw new Error('Error in matchAssets: ' + err)
    }
  }else{
    undefined
  }
}