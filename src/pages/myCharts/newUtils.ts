const typeJson = require("./type");
interface IType{
  label: string;
  key: string;
  type: string;
  value: string;
  name: string;
}

//获取排序的个数
export const getShowTopNumber=(data: any)=>{
  return data.chartType.rankValue;
}
export const oneLevelLineData=(data:any,generateData:any)=>{
  const topRes = getShowTopNumber(data);
  let topData = generateData;
  if(topRes){
    topData = topData.splice(0,topRes);
  }
  const prodTypeAndRateValue =  getProdTypeAndRateValue(data);
  return {topData,prodTypeAndRateValue};
}
export const getProdTypeAndRateValue=(data: any)=>{
  const rateOrValue = data.rateList[0]==='数值'?'value':'rate';
  const prodTypeList = data.prodType;
  const targetType = typeJson.filter((typeItem: IType)=>prodTypeList.includes(typeItem.name)&&typeItem.type===rateOrValue);
  return targetType;
}

export const getTypeShowData=(topData: any,prodTypeAndRateValue:IType[])=>{
  let seriesData:any = [];
  const keys = prodTypeAndRateValue.map((prodTypeAndRateValueItem:IType)=>prodTypeAndRateValueItem.key);
  for(let key of keys){
    const keyData = topData.map((topItem: any)=>topItem[key]);
    seriesData = addTwoArr(seriesData,keyData);
  }
  return seriesData;
}
export const addTwoArr=(a: number[],b:number[])=>{
  if(!a?.length){
      return b;
  }
  if(!b?.length){
    return a;
  }
  let c=a.map((v,i)=>b[i]+v)
  return c;
}
