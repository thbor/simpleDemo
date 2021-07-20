const typeJson = require("./type");
const test = require("./option");
console.log(12,test)
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
//3层显示2个x轴，2层显示1个x轴，3层时第一层x轴显示在最下面，第二层显示在上面
//  有几根线是根据最后一层数据来判断得，最后一层数据放在series里面
export const getMultipleLineCharts=(data:any,generateData:any,interval:any)=>{
  const {topData,prodTypeAndRateValue,TypeShowData} = oneLevelLineData(data,generateData);
  // console.log(111,prodTypeAndRateValue)
  console.log('prodTypeAndRateValue',prodTypeAndRateValue)
  console.log('topData',topData)
  console.log('data',data)

//   let option =  {
//     animation:false,
//     title:{
//       text:"",
//       left:"center",
//       padding:25
//     },
//     tooltip:{
//       trigger:"axis",
//       axisPointer:{
//         type:"cross",
//         crossStyle:{
//           color:"#999"
//           }
//         }
//     },
//     grid:{x:100,x2:20,y2:65},
//     legend:{show:true},
//     xAxis:xAxis,
//     yAxis:getYAxis(prodTypeAndRateValue,data,interval,0),
//     color:[
//         "#16BD3D",
//         "#0090FF",
//         "#FFA800",
//         "#FF2D2D",
//         "#FF6000",
//         "#9A4FFF",
//         "#6050FF",
//         "#29F0BA",
//         "#8ED531"
//     ],
//     series:series
// }
// console.log('iiii',option);

}
const getYAxis=(prodTypeAndRateValue:IType[],data:any,interval:number,minInterVal?:number)=>{
  const labelList = prodTypeAndRateValue.map((prodTypeAndRateValueItem:IType)=>prodTypeAndRateValueItem.label)
	let dw = data.rateList[0]==="比率"?"%":""
	let yNameStr = labelList.join("&");
	let yAxis = []
	let yObj = {
		type:"value",
		name:yNameStr,
		min:minInterVal||0,
		interval:interval,
		// axisLabel:{formatter:"{value}"+""},
		axisLabel:{formatter: '{value} '+dw},
	}
	yAxis.push(yObj)
	return yAxis
}
const getSeriesData=(newres:any,rate:string,type:string,generatedata:any,data:any,show?:Boolean)=>{
	let series = []
	let dw = rate==="比率"?'%':""
	for(let item of newres){
		let data = item.mapData
		let obj = {
			name:item.key,
			type:type,
			barMaxWidth: '60',
			label: {
				normal: {
					show: show||false,
					position: 'top',
					distance: 10,
					formatter: function (param:any) {
						var res = '';
						res += param.value + dw
						return res;
					},
					textStyle: {
						color: 'black',
					}
				}
			},
			data:data
		}
	series.push(obj)
	}
	return series
}
export const getTopData=(data:any,generateData:any)=>{
  const topRes = getShowTopNumber(data);
  let topData = generateData;
  if(topRes){
    topData = topData.splice(0,topRes);
  }
  return topData
}
export const oneLevelLineData=(data:any,generateData:any)=>{
  const topData = getTopData(data,generateData);
  const prodTypeAndRateValue =  getProdTypeAndRateValue(data);
  const TypeShowData =  getTypeShowData(topData,prodTypeAndRateValue)
  return {topData,prodTypeAndRateValue,TypeShowData};
}
export const getProdTypeAndRateValue=(data: any)=>{
  const rateOrValue = data.rateList[0]==='數值'?'value':'rate';
  console.log('rateOrValue00000000000',rateOrValue)
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
