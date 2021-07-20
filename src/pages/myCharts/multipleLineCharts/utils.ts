import itemTypeInfos from "./itemTypeInfos.json"
import {oneLevelLineData,getTypeShowData,getMultipleLineCharts,getProdTypeAndRateValue} from './newUtils'
interface IType{
  label: string;
  key: string;
  type: string;
  value: string;
  name: string;
}
interface lastLevels{
	level:any,
	obj:any
}
const legendColor = ['#16BD3D', '#0090FF','#FFA800','#FF2D2D','#FF6000','#9A4FFF','#6050FF','#29F0BA','#8ED531']

const getMyOption = (filterCondition: any,chartsJson: any)=> {
  const newOption = resolveLineData(filterCondition,chartsJson.data,2,'title',['不良率'],100,true,0);
  return newOption;
};

// import {useHistory} from "umi"
// let hisory2 = useHistory()
//獲取用戶是選擇了幾層,由於後台有些數據爲空時需要顯示NG，有些時候爲null時是沒有該層數據，
//所以需要前端根據選選擇的數據判斷是幾層數據
export const getLevelCount=(data:any)=>{
	let conLevel1 = data.conLevel1
	let conLevel2 = data.conLevel2
	let conLevel3 = data.conLevel3
	let itemType1 = conLevel1.itemType
	let itemType2 = conLevel2.itemType
	let itemType3 = conLevel3.itemType
	let count = 0;
	if(itemType1){
		count+=1;
	}
	if(itemType2>-1){
		count+=1;
	}
	if(itemType3>-1){
		count+=1;
	}
	return count
}
//總數據過濾項目的數據
const filterItemValueByGenerateData=(generatedata:any,data:any)=>{
	if(generatedata?.length){
		let itemValue = data.itemList[0]
		let filterData = generatedata.filter((item:any)=>item.defectName===itemValue)
		return filterData;
	}else{
		return []
	}
}
//柱狀圖和折線圖
export const getLevelsSameData=(generatedata:any,data:any)=>{
	let titles = getJsonTitle(data)
	//countLevels:獲取用戶是選擇了幾層
	let arr = []
	for(let i=0;i<generatedata.length;i++){
		let item = generatedata[i]
		if(item.levelName1){
			let levelName1 = item.levelName1
			let levelName2 = item.levelName2
			let levelName3 = item.levelName3
			let currentIndex = 
			arr.findIndex(item=>
				item.levelName1 === (levelName1||'NG') 
			&&item.levelName2 === (levelName2||'NG') 
			&&item.levelName3 === (levelName3||'NG'))
			//沒找到
			if(currentIndex<0){
				//初始化時，沒有同名的name個數爲1,isdefect0爲isdefect爲0的個數，isdefect1爲isdefect爲1個數據
				let obj = {levelName1:levelName1?levelName1:"NG",isdefect0:0,isdefect1:0,count:1,good:0,bad:0,levelName2:levelName2?levelName2:"NG",levelName3:levelName3?levelName3:"NG"}
				if(item.isDefect==0){
					obj.isdefect0+=1
				}else{
					obj.isdefect1+=1
				}
				arr.push(obj)
			}else{
				//尋找arr裡面是否有同名的數據(arr[currentIndex])，如果有同名數據，則將數據count+1，並且記錄isdefect0的數量
				arr[currentIndex].count+=1;
				if(item.isDefect==0){
					arr[currentIndex].isdefect0+=1
				}else{
					arr[currentIndex].isdefect1+=1
				}
			}
		}
	}
	//如果是柱状图并且有TOP值，则需要将值算出来
	let arr2 = sortTopArr(arr,titles.key,data)
	return arr2;
}
//過濾選擇產品類別良品不良品的數據
const getFilterTitleData=(generatedata:any,data:any)=>{
	let arr = []
	let itemValue = data.itemList[0];
	let filterName = generatedata.filter((item:any)=>item.defectName === itemValue)
	//不良品
	let bad = filterName.filter((item:any)=>item.isDefect==1&&item.workFlag==0)
	//報廢品 
	// isDefect：0，workFlag：1，判定為報廢品（實際不存在這種情況）
	// isDefect：1，workFlag：1，判定為報廢品
	let scrapped = filterName.filter((item:any)=>item.workFlag==1)
	//良品  isDefect：0，workFlag：0，判定為良品
	let good = filterName.filter((item:any)=>item.isDefect==0&&item.workFlag==0)
	let titles = getJsonTitle2(data)
	for(let item of titles){
		let key = item.key;
		if(key==="bad"){
			arr.push(bad)
		}
		if(key==="scrapped"){
			arr.push(scrapped)
		}
		if(key==="good"){
			arr.push(good)
		}
	}
	return arr
}
const getFilterGoodBad=(data1:any,data:any,generatedata:any)=>{
	let obj1 = {levelName1:data1.levelName1,levelName2:data1.levelName2,levelName3:data1.levelName3}
	let filterName = getFilterTitleData(generatedata,data)
	let res = filterName.filter((item:any)=>(item.levelName1||"NG")===obj1.levelName1&&(item.levelName2||"NG")===obj1.levelName2&&(item.levelName3||"NG")===obj1.levelName3)
	return res
}
const sortTopArr=(arr:any,key:any,data:any)=>{
	// let key = titles.key	//根据key值排序
	let top = Number(data.chartType.rankValue)
	if(!top){
		return arr
	}else{
		let arr2 = arr.sort((a:any,b:any)=> b[key] - a[key])
		let arr3 = arr2
		//散點圖和熱力圖顯示全部的tableData，因為前面rankValue已經被select佔用了，沒有TOP
		if(data.chartType.chartType!=="HEAT_MAP"&&data.chartType.chartType!=="SCATTER_PLOT"){
			arr3 = arr2.filter((arrItem:any,index:number)=>index<top)
		}
		return arr3
	}
		
}
const countKdata=(item:any)=>{
	let kData = []
	// let maxValue = item.maxValue
	// let minValue = item.minValue
	let pointValue = Number(item.pointValue)
	// kData.push(maxValue)
	// kData.push(minValue)
	kData.push(pointValue)
	return kData
}
//箱線圖適用
export const getLevelsSameData2=(generatedata:any,data:any)=>{
	let itemValue = data.itemList[0]
	let arr = []
	let allcount = 0
	for(let i=0;i<generatedata.length;i++){
		let item = generatedata[i]
		if(item.levelName1){
			let levelName1 = item.levelName1
			let levelName2 = item.levelName2
			let levelName3 = item.levelName3
			let currentIndex = arr.findIndex(item=>item.levelName1 === (levelName1||'NG') && item.levelName2 === (levelName2||'NG') &&item.levelName3 === (levelName3||'NG'))
			//沒找到
			
			if(currentIndex<0){
				//初始化時，沒有同名的name個數爲1,isdefect0爲isdefect爲0的個數，isdefect1爲isdefect爲1個數據
				let kData = countKdata(item)
				let obj = {levelName1:levelName1?levelName1:"NG",isdefect0:0,isdefect1:0,count:1,good:0,bad:0,levelName2:levelName2?levelName2:"NG",levelName3:levelName3?levelName3:"NG",kData:kData}
				if(item.isDefect==0){
					obj.isdefect0+=1
				}else{
					obj.isdefect1+=1
				}
				arr.push(obj)
			}else{
				//尋找arr裡面是否有同名的數據(arr[currentIndex])，如果有同名數據，則將數據count+1，並且記錄isdefect0的數量
				arr[currentIndex].count+=1;
				let oldkData = arr[currentIndex].kData
				let newkData = countKdata(item)
				let kData = oldkData.concat(newkData)
				arr[currentIndex].kData = kData
				if(item.isDefect==0){
					arr[currentIndex].isdefect0+=1
				}else{
					arr[currentIndex].isdefect1+=1
				}
			}
		}
	}
	for(let i=0;i<arr.length;i++){
		//良率根據0/count   不良率1/count
		 arr[i].good = (arr[i].isdefect0/allcount)*100
		arr[i].bad = (arr[i].isdefect1/allcount)*100
	}
	return arr;
}
export const getBarOption = (legendData:any,title:any,legendColor:any,xAixs:any,yAxis:any,series:any)=>{
	let option = {
		animation: false,
		title: {
			 text: title,
			 left: 'center',
			 padding:25
	 },
	 tooltip: {
			 trigger: 'axis',
			 axisPointer: {
					 type: 'cross',
					 crossStyle: {
							 color: '#999'
					 }
			 }
	 },
	 grid:{
		x: 100, 
		x2: 20,
		y2:65
		// y:120,
		// y2:160
	 },
	 legend: {
		 		show:false,
			//  data: legendData,
			//  top: 30,
			//  right:0,
	 },
	 xAxis: xAixs,
	 yAxis: yAxis,
	 color:legendColor,
	 series: series
	};
	return option
}
export const getPieOption = (legendData:any,title:any,legendColor:any,xAixs:any,yAxis:any,series:any)=>{
	let option = {
		// animation: false,
		title: {
			 text: title,
			 left: 'center'
	 },
	 tooltip: {
			 trigger: 'item',
			 formatter: '{a} <br/>{b}: {c} ({d}%)'
	 },
	 legend: {
			 data: legendData,
			//  bottom: 0,
	 },
	//  xAxis: xAixs,
	//  yAxis: yAxis,
	 color:legendColor,
	 series: series
	};
	return option
}



export const getXDataInfo=(xData:any,xLevels:any)=>{
	let xAixs = []
	for(let x=0;x<xData.length;x++){
		let obj = {
			type: 'category',
			name:xLevels[x],
			nameLocation:'start',
			nameGap:40,
			axisLine: {onZero: false},
			position:'bottom',
			offset:x*15,
			data: xData[x],
			axisPointer: {
				type: 'shadow'
		},
		}
		xAixs.push(obj)
	}
	return xAixs
}
//三層數據的bar
export const getBarOption1=()=>{
let xAxisData = ['a','b','c'] 
let xData1 = [1,2,3,4,5,6,7,8,9,10,11,12]
let xData2 = ['2-1','2-2','2-3','2-4','2-5','2-6']
let xData3 = ['3-1','3-2','3-3','3-4']
let xDataArr2 = [1,2,3,2,1,3]
let xDataValue2 =12
let xDataArr3 = [2,1,5,4]
let xDataValue3 =12
let colors2 = ['red','blue','green','pink','red','blue','green','pink','red','blue','green','pink','red','blue','green','pink','red','blue','green','pink']
let colors3 = ['red','blue','green','pink','red','blue','green','pink','red','blue','green','pink','red','blue','green','pink','red','blue','green','pink']
let alllevel = []
let a = {
    type: "bar",
    name: "a",
    data:[2,3,4,1,23,12,3,12,3,12,3,12,3,12,3,13]
}
let b = {
    type: "bar",
    name: "b",
    data:[2,3,4,1,23,12,3,12,3,12,3,12,3,12,3,13]
}
let c = {
    type: "bar",
    name: "c",
    data:[2,3,4,1,23,12,3,12,3,12,3,12,3,12,3,13]
}
alllevel.push(a)
alllevel.push(b)
alllevel.push(c)
for(let i=0;i<xData2.length;i++){
    let obj =  {
			"type": "bar",
			"barWidth": toPercent(xDataArr2[i]/xDataValue2),
			"xAxisIndex": 1,
			"yAxisIndex": 1,
			"outerAxis": 1,
			"barGap": "0%",
			"cursor": "pointer",
			data: [{
					name: xData2[i],
					value: 1
			}],
			label: {
					show: true,
					position: 'inside',
					formatter: '{b}',
					offset: [0, 10],
					textStyle: {
							color: 'white'
					}
			},
			color:colors2[i]
    }
    alllevel.push(obj)
}
for(let i=0;i<xData3.length;i++){
    let obj =  {
			"data": [{
					"name": xData3[i],
					"value": "1"
			}],
			"type": "bar",
			"barWidth": toPercent(xDataArr3[i]/xDataValue3),
			"xAxisIndex": 2,
			"yAxisIndex": 2,
			"outerAxis": 1,
			"barGap": "0%",
			"cursor": "pointer",
			"label": {
					"show": true,
					formatter: '{b}',
					"color": "#666",
					"position": "insideBottom",
					"textStyle": {
							"color": "white",
							"fontSize": "12"
					}
			},
			color:colors2[i]
    }
    alllevel.push(obj)
}

let option = {
    "tooltip": {
        "trigger": "item",
        "confine": true
    },
    "legend": {
        "right": "center",
        "width": "90%",
        "itemWidth": 10,
        "data": xAxisData,
        "type": "scroll",
        "align": "left",
        "selectedMode": true,
        "selected": null
    },
    "grid": [{
            "gridIndex": 0,
            "bottom": 160
        },
        {
            "height": 60,
            "gridIndex": 1,
            "tooltip": {
                "show": false
            },
            "bottom": 100
        },
        {
            "height": 60,
            "gridIndex": 2,
            "tooltip": {
                "show": false
            },
            "bottom": 40
        }
    ],
    "xAxis": [{
            name: '第二層名稱',
            nameLocation: 'start',
            nameTextStyle: {
                color: '#585858',
                padding: [0, 0, -53]
            },
            "type": "category",
            "data": xData1,
            "gridIndex": 0,
            "zlevel": 3,
            "show": true,
            "axisLine": {
                "lineStyle": {
                    "color": "#B1B1B1"
                }
            },
            "axisLabel": {
                "textStyle": {
                    "color": "#424648"
                }
            }
        },
        {
            name: '第三層名稱',
            nameLocation: 'start',
            nameTextStyle: {
                color: '#585858',
                padding: [0, 0, -53]
            },
            "type": "category",
            "isSeries": 1,
            "gridIndex": 1,
            "zlevel": 2,
            "show": true,
            "axisLine": {
                "show": false
            },
            "axisLabel": {
                "show": false
            },
            "splitLine": {
                "show": false
            },
            "axisTick": {
                "show": false
            }
        },
        {
            "type": "category",
            "isSeries": 1,
            "gridIndex": 2,
            "zlevel": 1,
            "show": true,
            "axisLine": {
                "show": false
            },
            "axisLabel": {
                "show": false
            },
            "splitLine": {
                "show": false
            },
            "axisTick": {
                "show": false
            }
        }
    ],
    "yAxis": [{
            "type": "value",
            "axisLabel": {
                "formatter": "{value} ",
                "textStyle": {
                    "color": "#424648"
                }
            },
            "gridIndex": 0,
            "show": true,
            "splitLine": {
                "show": true
            },
            "axisLine": {
                "lineStyle": {
                    "color": "#B1B1B1"
                }
            }
        },
        {
            "type": "value",
            "gridIndex": 1,
            "show": true,
            "axisLabel": {
                "show": false
            },
            "splitLine": {
                "show": false
            },
            "axisTick": {
                "show": false
            },
            "axisLine": {
                "show": false
            }
        },
        {
            "type": "value",
            "gridIndex": 2,
            "show": true,
            "axisLabel": {
                "show": false
            },
            "splitLine": {
                "show": false
            },
            "axisTick": {
                "show": false
            },
            "axisLine": {
                "show": false
            }
        }
    ],
    "series": alllevel,
}
return option;

}
const toPercent=(decimal:any)=>{
	return (decimal * 100).toFixed(4) + '%'
}
export const getJsonTitle2=(data:any)=>{
	const prodTypeAndRateValue = getProdTypeAndRateValue(data);
	const title = prodTypeAndRateValue.map((item:IType)=>{return{label:item.label,key:item.key}})
	// let prodTypes = data.prodType;
	// let rate = data.rateList[0]	//數值，比率
	// let allProdTitles = [
	// 	{name:"良品",label1:"良率",label2:"良品",rate:"goodRate",value:"good"},
	// 	{name:"不良品",label1:"不良率",label2:"不良品",rate:"badRate",value:"bad"},
	// 	{name:"報廢品",label1:"報廢率",label2:"報廢品",rate:"scrappedRate",value:"scrapped"}
	// ]
	// //1.根据产品类别的先将rateArr里面符合的数据筛选出来
	// let filterByProdType = allProdTitles.filter((item)=>prodTypes.includes(item.name))
	// //2.求数据还是比率
	// if(rate==="數值"){
	// 	let titles = filterByProdType.map((item)=>{return {label:item.label2,key:item.value}})
	// 	return titles
	// }else if(rate==="比率"){
	// 	let titles = filterByProdType.map((item)=>{return {label:item.label1,key:item.rate}})
	// 	return titles
	// }else{
	// 	console.log("获取标题失败")
	// 	return []
	// }
	return title;
	
}
export const getJsonTitle3=(data:any)=>{
	let title2s = getJsonTitle2(data)
	let rate = data.rateList[0]	//數值，比率
	let arr:any = []
	for(let i=0;i<title2s.length;i++){
		if(rate==="數值"){
			let obj = {label:title2s[i].label+"值",key:title2s[i].key}
			arr.push(obj)
		}
		else if(rate==="比率"){
			let obj = {label:title2s[i].label+"",key:title2s[i].key}
			arr.push(obj)
		}
	}
	return arr
}
export const getJsonTitle =(data:any)=>{
	let title2 = getJsonTitle2(data)
	let prodTypes = data.prodType
	let prodType = data.prodType[0]		//良品，不良品
	let rate = data.rateList[0]	//數值，比率
	let choosedkey = {label:"不良率",key:'bad'}
	let rateArr = [
		{name:"良品",label:"良率",rate:"goodRate",value:"good"},
		{name:"不良品",label:"不良率",rate:"badRate",value:"bad"},
		{name:"報廢品",label:"報廢率",rate:"scrappedRate",value:"scrapped"}
	]
	//1.根据产品类别的先将rateArr里面符合的数据筛选出来
	let filterByProdType = rateArr.filter((item)=>prodTypes.includes(item.name))
	if(rate==="比率"){
		if(prodType==="良品"){
			choosedkey={label:"良率",key:'good'}
		}
		else if(prodType==="不良品"){
			choosedkey={label:"不良率",key:'bad'}
		}
		else if(prodType==="報廢品"){
			// message.error("目前數據不支持")
			choosedkey = {label:"報廢率",key:"scrapped"}
		}else{
			// message.error("請檢查數據")
			choosedkey = {label:"",key:""}}
	}
	else if(rate==="數值"){
		if(prodType==="良品"){
			// choosedkey={label:"良品值",key:'isdefect0'}
			choosedkey={label:"良品值",key:'goodRate'}
		}
		else if(prodType==="不良品"){
			// choosedkey={label:"不良品值",key:'isdefect1'}
			choosedkey={label:"不良品值",key:'badRate'}
		}
		else if(prodType==="報廢品"){
			// message.error("目前數據不支持")
			choosedkey = {label:"報廢值",key:"scrappedRate"}
		}else{
			// message.error("請檢查數據")
			choosedkey = {label:"",key:""}	}
	}
	return choosedkey
}
// 新逻辑：配合"isDefect“字段一起判斷，產品類別，具體為以下情況：
// 1.isDefect：0，workFlag：0，判定為良品
// 2.isDefect：0，workFlag：1，判定為報廢品（實際不存在這種情況）
// 3.isDefect：1，workFlag：0，判定為不良品
// 4.isDefect：1，workFlag：1，判定為報廢品

//獲取產品類別的不同種類
const getSpecies=(generatedata:any,data:any)=>{
	let itemValue = data.itemList[0]
	if(generatedata?.length&&typeof generatedata==="object"){
		let good = generatedata.filter((item:any)=>item.workFlag==0&&item.isDefect==0)
		let bad = generatedata.filter((item:any)=>item.workFlag==0&&item.isDefect==1)
		bad = bad.filter((item:any)=>item.defectName === itemValue)
		let scrapped = generatedata.filter((item:any)=>item.workFlag==1)
		scrapped = scrapped.filter((item:any)=>item.defectName === itemValue)
		return {good,bad,scrapped}
	}else{
		return {}
	}
	
}
//過濾前面選擇的類別
const getSpeciesByTitles=(generatedata:any,data:any)=>{
	const {good,bad,scrapped} = getSpecies(generatedata,data);
	let titles = getJsonTitle2(data)
	let keys = titles.map((item:any)=>item.key)
	let obj:any = {}
	for(let key of keys){
		if(key==="bad"||key==="badRate"){
			obj.bad = bad;
		}
		if(key==="scrapped"||key==="scrappedRate"){
			obj.scrapped = scrapped;
		}
		if(key==="good"||key==="goodRate"){
			obj.good = good;
		}
	}
	return obj;
}
const solveOneSpecies=(speciesData:any,key:string)=>{
	let arr:any = []
	if(speciesData?.length){
		for(let i=0;i<speciesData.length;i++){
			let item = speciesData[i];
			let index = arr.findIndex((aItem:any)=>
			aItem.levelName1 === (item.levelName1)&&
			aItem.levelName2 === (item.levelName2)&&
			aItem.levelName3 === (item.levelName3))
			if(index>-1){
				arr[index].count+=1
			}else{
				let obj = {key:key,levelName1:item.levelName1,levelName2:item.levelName2,levelName3:item.levelName3,isDefect:item.isDefect,workFlag:item.workFlag,count:1}
				arr.push(obj)
			}
		}
	}
	return arr
}
//判斷是否是日期
const isValidDate=(date:any)=>{
  return date instanceof Date && !isNaN(date.getTime())
}
const sortLevelName=(topres:any,key:any)=>{
	console.log('topres',topres)
	console.log('key',key)
	if(topres?.length){
		let myDate:any = new Date(topres[0][key])
		let ifDate = isValidDate(myDate)
		if(ifDate){
			//日期升序排序
			topres.sort((a:any,b:any)=>new Date(a[key]).getTime()-new Date(b[key]).getTime())
		}else{
			//字符串排序
			topres.sort((a:any,b:any)=>a-b)
		}
	}

}
//根據選擇的1,2,3層數據進行排序，先排第一層
const sortDataByTop=(topres:any,data:any)=>{
	sortLevelName(topres,"levelName1")
	sortLevelName(topres,"levelName2")
	sortLevelName(topres,"levelName3")
}
const getTopDataByLevels=(all:any,lastLevels:any,rankValue:any)=>{
	let levelNum = lastLevels.level
	let alllevelName = all.map((item:any)=>item['levelName'+levelNum])
	let unilevelName = Array.from(new Set(alllevelName))
	let arr:any = []
	// 返回unilevelName3每一个对应的前Top的数据
	for(let i=0;i<unilevelName.length;i++){
		let key = unilevelName[i];
		let filterData = all.filter((item:any)=>item['levelName'+levelNum] === key)
		filterData = filterData.sort((a:any,b:any)=>b.count - a.count)
		filterData = filterData.filter((item:any,index:number)=>index<Number(rankValue))
		arr = arr.concat(filterData)
	}
	return arr
}
//處理前top的數據，排序
const solveTopData=(all:any,data:any)=>{
	let rankValue = data.chartType.rankValue?Number(data.chartType.rankValue):0
	let lastLevels:lastLevels = getLastLevels(data)
	let type = data.chartType.chartType
	if(lastLevels?.level>=2&&type==="柱狀圖"&&rankValue){
		//根据第三层的数据筛选前TOP的，而不是所有数据中筛选top的
		let topRes = getTopDataByLevels(all,lastLevels,rankValue)
		return topRes
	}
	//合併myObj
	for(let i=0;i<all.length;i++){
		all[i].key = ''
		//根據count排序
	}
	//排序，從大到小排序
	let res = all.sort(function(a:any,b:any){
		return b.count - a.count;
	})
	//所有數據
	if(!rankValue){
		return res
	}else{
		let topRes = res.filter((item:any,index:number)=>index<rankValue)
		return topRes
	}

}
const combineMyObj=(myObj:any)=>{
	let all:any = []
	let arr:any = []
	for(let i=0;i<myObj.length;i++){
		all = all.concat(myObj[i].data) 
	}
	for(let i=0;i<all.length;i++){
		let item = all[i]
		let index = arr.findIndex((aItem:any)=>
		aItem.levelName1===item.levelName1&&
		aItem.levelName2===item.levelName2&&
		aItem.levelName3===item.levelName3)
		if(index>-1){
			arr[index].count+=item.count
			addByKey2(arr[index],item)
		}else{
			addByKey(item)
			arr.push(item)
		}
	}
	// let count = arr.map((item:any)=>item.count)
	return arr	
}
const addByKey2=(arrIndex:any,item:any)=>{
	if(item.key=="good"){
		arrIndex.good?arrIndex.good:arrIndex.good=0
		arrIndex.good+=item.count
	}
	if(item.key=="bad"){
		arrIndex.bad?arrIndex.bad:arrIndex.bad=0
		arrIndex.bad+=item.count
	}
	if(item.key=="scrapped"){
		arrIndex.scrapped?arrIndex.scrapped:arrIndex.scrapped=0
		arrIndex.scrapped+=item.count
	}
}
const addByKey=(item:any)=>{
	if(item.key=="good"){
		item.good = item.count
	}
	if(item.key=="bad"){
		item.bad = item.count
	}
	if(item.key=="scrapped"){
		item.scrapped = item.count
	}
}
//獲取投入數
const getPutNum=(all:any,generatedata:any)=>{
	for(let i=0;i<all.length;i++){
		let aItem = all[i];
		let filterData = getFilterData(generatedata,aItem)
		aItem.putNumber = filterData.length
	}
}
const getRate=(all:any)=>{
	for(let i=0;i<all.length;i++){
		all[i].good = all[i].good?all[i].good:0
		all[i].bad = all[i].bad?all[i].bad:0
		all[i].scrapped = all[i].scrapped?all[i].scrapped:0
		all[i].goodRate = all[i].good?Number((all[i].good/all[i].putNumber).toFixed(4)):0
		all[i].badRate = all[i].bad?Number((all[i].bad/all[i].putNumber).toFixed(4)):0
		all[i].scrappedRate = all[i].scrapped?Number((all[i].scrapped/all[i].putNumber).toFixed(4)):0
	}
}
const getFilterData=(generatedata:any,obj:any)=>{
	let filterData = generatedata.filter((item:any)=>item.levelName1 === obj.levelName1)
	let filterData2 = filterData.filter((item:any)=>item.levelName2 === obj.levelName2)
	let filterData3 = filterData2.filter((item:any)=>item.levelName3 === obj.levelName3)
	//1和2的差集
	// let distinct2 = [...filterData].filter(x => [...filterData2].every(y => y.partSn !== x.partSn));
	// console.log("差集",distinct2)
	return filterData3
}

//將選擇的generatedata的數據按照data篩選條件放，并根據判定良品與否條件整理數據
const getLevelsSameData3=(generatedata:any,data:any)=>{
	let titles = getJsonTitle2(data)
	//countLevels:獲取用戶是選擇了幾層
	//1.將generatedata分為3大類，需要匯總
	let species = getSpeciesByTitles(generatedata,data)
	//2.再將每一類做當前處理
	let keys = Object.keys(species);
	let myObj:any = []
	for(let key of keys){
		let item = species[key]
		let arr = solveOneSpecies(item,key)
		let labelIndex = titles.findIndex((item:any)=>item.key === key)
		let label = labelIndex>-1?titles[labelIndex].label:""
		let current = {key:key,data:arr,label:label}
		myObj.push(current)
	}
	//3.合併數據
	let all = combineMyObj(myObj)
	//4.為合併的數據找到投入數
	getPutNum(all,generatedata)
	getRate(all)
	//5.返回排序后的top數據
	let topres = solveTopData(all,data)
	sortDataByTop(topres,data)
	let put = all.map((item:any)=>item.putNumber)
	if(put?.length){
		let allput = put.reduce((pre:any,next:any)=>pre+next)
	}
	return topres
}

//柱狀圖和折線圖適用
export const commonFun=(data:any,generatedata:any)=>{
	//拿到levelName1,levelName2,levelName3這三級的同名的數據名字和isdefect的數據及總個數，及不良率
	let titles = getJsonTitle2(data)
	let arr = getLevelsSameData3(generatedata,data)
	let countLevels = getLevelCount(data)
	let t1 = arr.map((item:any)=>item.levelName1)
	let t2 = arr.map((item:any)=>item.levelName2)
	let t3 = arr.map((item:any)=>item.levelName3)
	let xData1=[t1,t2,t3]
	if(countLevels<3){
		if(countLevels===2){
			xData1=[t1,t2]
		}
		if(countLevels===1){
			xData1=[t1]
		}
	}
	let ax = []
	if(data.conLevel1){
		let obj = itemTypeInfos.find((item:any)=>item.itemType === data.conLevel1.itemType)
		if(obj){
			ax.push(obj.label)
		}
	}
	if(data.conLevel2){
		let obj = itemTypeInfos.find((item:any)=>item.itemType === data.conLevel2.itemType)
		if(obj){
			ax.push(obj.label)
		}
	}
	if(data.conLevel3){
		let obj = itemTypeInfos.find((item:any)=>item.itemType === data.conLevel3.itemType)
		if(obj){
			ax.push(obj.label)
		}
	}
	let xData = xData1.reverse()
	ax = ax.reverse()
	let yData = arr.map((item:any)=>item.count)
	let yDataRate = getTargetRateArr(data,arr)
	return {xData,ax,yData,arr,titles,yDataRate}
}

const getTargetRateArr=(data:any,arr:any)=>{
	let goodRate = []
	let badRate:any = []
	let scrappedRate:any = []
	let rate = data.rateList[0]
	let targetRateArr:any = []
	let targetKeys = getTargetKeys(data)
	console.log('999',data)
	console.log('000',targetKeys)
	if(rate==="比率"){
		goodRate = arr.map((item:any)=>item.goodRate)
		badRate = arr.map((item:any)=>item.badRate)
		scrappedRate = arr.map((item:any)=>item.scrappedRate)
		if(targetKeys.includes("good")){
			targetRateArr=(goodRate)
		}
		if(targetKeys.includes("bad")){
			if(targetRateArr.length===0){
				targetRateArr=badRate
			}else{
				targetRateArr = targetRateArr.map((item:any,index:number)=>item+badRate[index])
			}
		}
		if(targetKeys.includes("scrap")){
			if(targetRateArr.length===0){
				targetRateArr=(scrappedRate)
			}else{
				targetRateArr = targetRateArr.map((item:any,index:number)=>item+scrappedRate[index])
			}
		}
	}
	targetRateArr = targetRateArr.map((item:any)=>(item*100).toFixed(2))
	return targetRateArr
}
//箱線圖適用
export const commonFun2=(data:any,generatedata:any)=>{
	//拿到levelName1,levelName2,levelName3這三級的同名的數據名字和isdefect的數據及總個數，及不良率
	let titles = getJsonTitle(data)
	let countLevels = getLevelCount(data)
	let key = titles.key
	let arr = getLevelsSameData2(generatedata,data)
	let t1 = arr.map((item:any)=>item.levelName1)
	let t2 = arr.map((item:any)=>item.levelName2)
	let t3 = arr.map((item:any)=>item.levelName3)
	let t=[t1,t2,t3]
	if(countLevels<3){
		if(countLevels===2){
			t=[t1,t2]
		}
		if(countLevels===1){
			t=[t1]
		}
	}
	let ax = []
	let yData = [arr.map(item=>Math.floor(item[key]*100)/100)]
	if(data.conLevel1){
		let obj = itemTypeInfos.find((item:any)=>item.itemType === data.conLevel1.itemType)
		if(obj){
			ax.push(obj.label)
		}
	}
	if(data.conLevel2){
		let obj = itemTypeInfos.find((item:any)=>item.itemType === data.conLevel2.itemType)
		if(obj){
			ax.push(obj.label)
		}
	}
	if(data.conLevel2){
		let obj = itemTypeInfos.find((item:any)=>item.itemType === data.conLevel3.itemType)
		if(obj){
			ax.push(obj.label)
		}
	}
	let xData = t
	ax = ax.reverse()
	return {xData,ax,yData,arr,titles}
}
const oldResolveBarData=(data:any,generatedata:any,interval:number,title:any,legendData:any,maxInterVal:any,show?:boolean,minInterVal?:number)=>{
	const {xData,ax,yData,titles,yDataRate} = commonFun(data,generatedata)
		let yNames = [titles[0].label,'']
		let YDATA = yData
		let dw = ''
		if(titles[0].label.indexOf("率")!=-1){
			dw = "%"
			YDATA = yDataRate
		}
		let xAixs =[]
		let yAxis = []
		let series = []
		for(let x=0;x<xData.length;x++){
			let myName = ax[x]
			let offset = x
			if(xData[x][0]&&xData[x][0]!=='NG'){
				myName = ax[0]
			}
			if(ax.length===1){
				offset = 0
			}
			if(xData[x][0]&&xData[x][0]!=='NG'){
				let obj = {
					axisLabel: { interval:0, rotate:40 },
					type: 'category',
					name:myName,
					nameLocation:'start',
					nameGap:40,
					axisLine: {onZero: false},
					position:'bottom',
					offset:offset*17,
					barWidth:'10%',
					data: xData[x],
					axisPointer: {
						type: 'shadow'
				},
				}
				xAixs.push(obj)
			}else{
				xAixs.push({})
			}
		}
		// for(let y=0;y<yNames.length;y++){
			let obj = {
				type: 'value',
				name: legendData.join("&"),
				min: minInterVal||0,
				interval: interval,
				axisLabel: {
						formatter: '{value} '+dw,
				},
				maxInterVal:maxInterVal
			}
			yAxis.push(obj)
		// }
		// for(let s=0;s<yData.length;s++){
			let objy = {
				name: legendData.join("&"),
				type: 'bar',
				barMaxWidth:20,
				label: {
          normal: {
            show: show,
            position: 'top',
            distance: 10,
          
            formatter: function (param:any) {
              var res = '';
              res += param.value
                + dw
              return res;
            },
            textStyle: {
              color: 'black',
            }
          }
        },
				data: YDATA
			}
			series.push(objy)
		// }
		xAixs = xAixs.filter((item:any)=>(Object.keys(item)).length)
		if(xAixs.length===0){xAixs.push({})}
		let options = getBarOption(legendData,title,legendColor,xAixs,yAxis,series)
		return options
}
export const resolveBarData=(data:any,generatedata:any,interval:number,title:any,legendData:any,maxInterVal:any,show?:boolean,minInterVal?:number)=>{
	let lastLevels:lastLevels = getLastLevels(data)
	if(lastLevels?.level<=1||!lastLevels?.level){
		//原來三層的那種寫法
		return oldResolveBarData(data,generatedata,interval,title,legendData,maxInterVal,show,minInterVal)
	}else{
		//現在兩層的寫法
		return newResolveBarData(lastLevels,data,generatedata,interval,title,legendData,maxInterVal,show,minInterVal)
	}

}

export const getLastLevels=(data:any)=>{
	let conLevel3 = data.conLevel3;
	let itemType3 = conLevel3.itemType;
	if(itemType3&&itemType3!==-1){
		return {level:3,obj:conLevel3}
	}
	let conLevel2 = data.conLevel2;
	let itemType2 = conLevel2.itemType;
	if(itemType2&&itemType2!==-1){
		return {level:2,obj:conLevel2}
	}
	let conLevel1 = data.conLevel1;
	let itemType1 = conLevel1.itemType;
	if(itemType1&&itemType1!==-1){
		return {level:1,obj:conLevel1}
	}
	return {level:undefined,obj:null}
}

export const resolveLineData=(data:any,generatedata:any,interval:number,title:any,legendData:any,maxInterVal:number,show?:Boolean,minInterVal?:number)=>{
	let lastLevels:lastLevels = getLastLevels(data)
	if(lastLevels?.level<=1||!lastLevels?.level){
    const {topData,prodTypeAndRateValue} =  oneLevelLineData(data,generatedata);
    const option =  oldResolveLineData(topData,prodTypeAndRateValue,data,generatedata,interval,title,legendData,maxInterVal,show,minInterVal)
    return option;
  }else{
		//現在兩層的寫法
		return newResolveLineData(lastLevels,data,generatedata,interval,title,legendData,maxInterVal,show,minInterVal)
	}
}
export const newResolveBarData=(lastLevels:any,data:any,generatedata:any,interval:number,title:any,legendData:any,maxInterVal:number,show?:Boolean,minInterVal?:number)=>{
	return commonResolveData(lastLevels,data,generatedata,interval,title,legendData,maxInterVal,"bar",show,minInterVal)
}
export const getMaxInterValue=(option:any)=>{
	if(option?.series){
		let res = option.series
		let arr:any = []
		for(let item of res){
			arr = arr.concat(item.data)
		}
		if(!arr.length){
			return 0
		}
		let max = Math.max(...arr)
		return max
	}
	return 0
}
// export const oneLevelLineData=(data:any,generateData:any)=>{
//   const topData = getTopData(data,generateData);
//   const prodTypeAndRateValue =  getProdTypeAndRateValue(data);
//   return {topData,prodTypeAndRateValue};
// }
const commonResolveData=(lastLevels:any,data:any,generatedata:any,interval:number,title:any,legendData:any,maxInterVal:number,type:string,show?:Boolean,minInterVal?:number)=>{
	//1.獲取最後一層的key值
	// const {topData,prodTypeAndRateValue} = oneLevelLineData(data,generatedata)
	let levelNum = lastLevels.level
	let key = "levelName"+levelNum
	//拿到generate裡面對應的key值
	//2.根據key值將generateData分組  
	let res = groupDataByKey(key,generatedata)
	//3.獲取xAxis除了lastLevels之外的其他層的titles
	let yAxis = getYAxis(data,interval,minInterVal)
	//過濾得到series的數據
	if(res?.length){
		//拿到x軸和y軸即滿足條件的每一個數組，及求出比率
		let newres = getValueRateByRes(res,generatedata,lastLevels,data)
	// 	//4.拿到用戶要算的數據的標題
	
		let targetKeys = getTargetKeys(data)
	// 	//5.computedValues這個數據得到targetKeys所組合的數據
		// newres = getTopData(newres,generatedata,data)
		getTargetComputedData(targetKeys,newres,generatedata)
		let xAxis = getXAxis(lastLevels,data,newres)
		console.log('xAxis',xAxis)
	// 	//6查看rate取到我要的數據是數值還是比率
		let rate = data.rateList[0]
		let key = "targetValue"
		if(rate==="比率"){
			key = "targetRate"
		}
		console.log('88888888rate',rate,key)

	// 	//7.computedValues通過map拿到data組裝成series裡面的數據
		MapDataByKey(newres,key)
		let series = getSeriesData(newres,rate,type,generatedata,data,show);
		let option =  {
			animation:false,
			title:{
				text:"",
				left:"center",
				padding:25
			},
			tooltip:{
				trigger:"axis",
				axisPointer:{
					type:"cross",
					crossStyle:{
						color:"#999"
						}
					}
			},
			grid:{x:100,x2:20,y2:65},
			legend:{show:true},
			xAxis:xAxis,
			yAxis:yAxis,
			color:[
					"#16BD3D",
					"#0090FF",
					"#FFA800",
					"#FF2D2D",
					"#FF6000",
					"#9A4FFF",
					"#6050FF",
					"#29F0BA",
					"#8ED531"
			],
			series:series
	}
	return option
	}else{
		return {}
	}
}
export const newResolveLineData=(lastLevels:any,data:any,generatedata:any,interval:number,title:any,legendData:any,maxInterVal:number,show?:Boolean,minInterVal?:number)=>{
	return commonResolveData(lastLevels,data,generatedata,interval,title,legendData,maxInterVal,"line",show,minInterVal)
}
const getCommonData=(allData:any,generatedata:any)=>{
	let arr = []
	for(let item of allData){
		let key = item.levelName1+item.levelName2+item.levelName3;
		let index = generatedata.findIndex((gItem:any)=>gItem.levelName1+gItem.levelName2+gItem.levelName3 === key);
		if(index>-1){
			arr.push(generatedata[index])
		}
	}
	return arr
}
const getTopData=(newres:any,generatedata:any,data:any)=>{
	let arr:any = []
	let all = commonFun(data,generatedata)
	let allData = all.arr
	for(let item of allData){
		let key1 = item.levelName1+","+item.levelName2+","+(item.levelName3||"NG");
		let lastLevelName = !item.levelName3? !item.levelName2?item.levelName1:item.levelName2:item.levelName3
		// 過濾二維數據的i和j
		let i = newres.findIndex((IItem:any)=>IItem.key === lastLevelName);
		if(i>-1){
			let computedValues = newres[i].computedValues;
			let j = computedValues.findIndex((jItem:any)=>jItem.levelName1+","+jItem.levelName2+","+jItem.levelName3 === key1);
			if(j>-1){
				arr.push({i,j})
			}
		}
	}
	//如果不在arr對應的位置，則過濾數據
	let allIndexi = arr.map((aItem:any)=>aItem.i);
	let allIndexStr = arr.map((aItem:any)=>aItem.i+" "+aItem.j);
	for(let i1=0;i1<newres.length;i1++){
		for(let j1=0;j1<newres[i1].computedValues.length;j1++){
			let key = i1+" "+j1
			if(!allIndexStr.includes(key)){
				newres[i1].computedValues[j1].bad = 0
				newres[i1].computedValues[j1].good = 0
				newres[i1].computedValues[j1].scrap = 0
				newres[i1].computedValues[j1].badRate = 0
				newres[i1].computedValues[j1].goodRate = 0
				newres[i1].computedValues[j1].scrapRate = 0
			}
		}
	}
	newres = newres.filter((nItem:any,index:number)=>allIndexi.includes(index))
	return newres
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
const MapDataByKey=(newres:any,key:string)=>{
	for(let item of newres){
		let computedValues = item.computedValues;
		let mapData = computedValues.map((item2:any)=>item2[key]||0 )
		item.mapData = mapData
	}
}
const getTargetComputedData=(targetKeys:Array<String>,newres:any,generatedata:Array<any>)=>{
	console.log(7777777)
	for(let item of newres){
		let computedItem = item.computedValues;
		for(let item2 of computedItem){
			item2.targetValue = 0
			item2.targetRate = 0
			let keys = Object.keys(item2);
			for(let key of keys){
				let index = targetKeys.findIndex((tItem:any)=>tItem === key)
				if(index>-1){
					item2.targetValue+=item2[key]
				}
			}
			item2.targetRate = item2.count?Number(((item2.targetValue/item2.count)*100).toFixed(2)):0
		}
	}
}
const getTargetKeys=(data:any)=>{
	const prodTypeAndRateValue = getProdTypeAndRateValue(data);
	let targetKeys = prodTypeAndRateValue.map((item:any)=>item.key);
	return targetKeys
}


const getValueRateByRes=(res:any,generatedata:any,lastLevels:any,paramsData:any)=>{
	//levelNum:需要過濾的層數
	for(let item1 of res){
		let data = item1.data;
		// data = data.filter((item:any)=>item.defectName === itemValue)
		let arr:any = []
		//求出此時x軸對應的兩個數據
		for(let i=0;i<data.length;i++){
			let item2 = data[i]
			//將相同的levelName1，2,3的數據放在一起，組
			let allkeys = arr.map((item:any)=>item.key)
			let currentKey = item2.levelName1+","+item2.levelName2+","+(item2.levelName3||"NONE")
			//不重複的x軸的key
			//這裡的Key需要拼接幾層在於前面選擇的層數是幾層
			
			let uniXKey = lastLevels?.level===3?item2.levelName1+","+item2.levelName2:lastLevels?.level===2?item2.levelName1:""
			console.log('uniXKey',uniXKey)
			let index = allkeys.findIndex((item:any)=>item === currentKey)
			if(index>-1){
				arr[index].count+=1
				// checkType(item2,arr[index],itemValue)
			}else{
				const copyItem = {...item2};
				copyItem.currentKey = currentKey
				copyItem.uniXKey = uniXKey
				copyItem.count = 1
				arr.push(copyItem)
			}
		}
		item1.computedValues = arr
	}
	let unikeys2 = getUni2Keys(res)
	for(let item of res){
		let newArr:any = []
		for(let item2 of unikeys2){			
				let index = item.computedValues.findIndex((cItem:any)=>cItem.uniXKey === item2)	
				if(index>-1){
					newArr.push(item.computedValues[index])
				}else{
					const ZeroItem = {...item};
					ZeroItem.key = item2+","+item.key
					ZeroItem.levelName1 = item2.split(",")[0]||"NONE"
					ZeroItem.levelName2 = item2.split(",")[1]||"NONE"
					ZeroItem.levelName3 =  item.key||"NONE"
					ZeroItem.uniXKey = item2
					newArr.push(ZeroItem)
			}
		}
		item.computedValues = newArr
		sortDataByTop(newArr,paramsData)
	}
	
	return res
}
// isDefect：0，workFlag：0，判定為良品		良品从所有中(不过滤defaultName)
// isDefect：1，workFlag：0，判定為不良品		其他从defaultName对应中拿
const checkType=(item2:any,obj:any,itemValue:any)=>{
	if(item2.workFlag==1){
		//報廢品
		if(item2.defectName===itemValue){
			obj.scrap+=1
		}
	}
	else {
		if(item2.isDefect==="1"||item2.isDefect===1){
			// 不良品
			if(item2.defectName===itemValue){
				obj.bad+=1
			}
		}
		else{
			// 良品
			obj.good+=1
		}
	}
}
const getYnames = (data:any)=>{
	//這裡主要是求y軸的那個name
	let rateList = data.rateList;	//比率，數值
	let prodType = data.prodType;	//良品,不良品
	let dwLabel = ''
	if(rateList[0]==="比率"){
		dwLabel = '率'
	}
	if(rateList[0]==="數值"){
		dwLabel = '值'
	}
	let arr = []
	for(let i=0;i<prodType.length;i++){
		let item = prodType[i]
		let preLabel = item.substring(0,item.length-1);
		let label = preLabel+dwLabel
		arr.push(label)
	}
	return arr
}
const getYAxis=(data:any,interval:number,minInterVal?:number)=>{
	let dw = data.rateList[0]==="比率"?"%":""
	let ynames = getYnames(data);
	let ynameStr = ynames.join("&");
	let yAxis = []
	let yobj = {
		type:"value",
		name:ynameStr,
		min:minInterVal||0,
		interval:interval,
		// axisLabel:{formatter:"{value}"+""},
		axisLabel:{formatter: '{value} '+dw},
	}
	yAxis.push(yobj)
	return yAxis
}
//獲取不重複的2層key
const getUni2Keys=(newres:any)=>{
	let arr:any = []
	for(let item2 of newres){
		let res = item2.computedValues
		//找到所有不重複的uniXKey的數據放入arr
		for(let item3 of res){
			if(!arr.includes(item3.uniXKey)){
				arr.push(item3.uniXKey)
			}
		}
	}
	return arr
}
const getXAxis=(lastLevels:any,data:any,newres:any)=>{
	let arr = getUni2Keys(newres)
	let xAxis = []
	//根據arr去拿到真正的值，沒有的補全數值為0
	// //2層的key
	let levelNum = lastLevels.level
	let levelName1s = arr.map((item:any)=>item&&item.split(",")[0])
	let levelName2s = arr.map((item:any)=>item&&item.split(",")[1])
	if(levelNum===3){
		let x3 = getX(data,levelName2s,2,1)
		let x2 = getX(data,levelName1s,1,2)
		x3&&xAxis.push(x3)
		x2&&xAxis.push(x2)
	}
	else if(levelNum === 2){
		let x2 = getX(data,levelName1s,1,-1)
		x2&&xAxis.push(x2)
	}
	return xAxis

}
const getX=(data:any,levelName2s:any,number:number,offsetIndex?:number)=>{
	console.log('itemTypeInfos',itemTypeInfos);

	let nameIndex2 = itemTypeInfos.findIndex((item:any)=>(item.itemType).toString() === (data["conLevel"+number].itemType).toString())
	let lastLevels:lastLevels = getLastLevels(data)
	let levelCount = lastLevels?.level;
	if(nameIndex2>-1){
		let obj3:any = {
			axisLabel:levelCount<=2?{ interval:0, rotate:40 }:{},
			type:"category",
			name:nameIndex2>-1?(itemTypeInfos[nameIndex2].label||"暫無"):"暫無",
			nameLocation:"start",
			nameGap:40,
			axisLine:{
				onZero:false
			},
			position:"bottom",
			offset:offsetIndex===-1?0:offsetIndex?offsetIndex*17:number*17,
			data:levelName2s,
			axisPointer:{
				type:"shadow"
			}
		}
		// if(number===1){
		// 	obj3.axisLabel.interval=0 
		// 	obj3.axisLabel.rotate=40 
		// }
		return obj3
	}else{
		return false
	}

}
const groupDataByKey=(key:string,generatedata:any)=>{
	//1.獲取所有不重複對應key的值
	let dataByKey = generatedata.map((item:any)=>item[key]);
	let mapByKey = Array.from(new Set(dataByKey));
	//2.根據mapByKey將generatedata數據分組,有幾個mapKey就要有幾根折線圖
	let arr:any = []
	for(let item1 of generatedata){
		for(let item2 of mapByKey){
			if(item2 === item1[key]){
				//查看arr數組是否有已有該key值對應的數據，有的話就放在key對應的數據，沒有就新加一個
				let index = arr.findIndex((item:any)=>item.key === item2)
				if(index>-1){
					//已存在，將數據放在對應的key位置
					arr[index].data.push(item1)
				}else{
					arr.push({key:item2,data:[item1]})
				}
			}
		}
	}
	return arr
}
export const oldResolveLineData=(topData:any,prodTypeAndRateValue:any,data:any,generatedata:any,interval:number,title:any,legendData:any,maxInterVal:number,show?:Boolean,minInterVal?:number)=>{
	const {ax,titles} = commonFun(data,generatedata)
  const xData = topData.map((topItem: any)=>topItem.levelName1)

	//这里需要将xData的第一层拿去作为series的数据
	let dw = ''
	if(titles[0].label.indexOf("率")!=-1){
		dw = "%"
	}
	let yAxis = []
	let series = []
  let xAixs =  {
    type: 'category',
    axisLabel: { interval:0, rotate:40 },
    name:ax[0],
    nameLocation:'start',
    nameGap:40,
    axisLine: {onZero: false},
    position:'bottom',
    offset:0,
    data: xData,
    axisPointer: {
      type: 'shadow'
  },
  }
		let objy = {
			type: 'value',
			name: legendData.join("&"),
			min: minInterVal||0,
			interval: interval,
			axisLabel: {
					formatter: '{value} '+dw,
			}
		}
		yAxis.push(objy)
		let obj = {
			name: legendData.join("&"),
			type: 'line',
			label: {
				normal: {
					show: show,
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
			data: getTypeShowData(topData,prodTypeAndRateValue)
		}
	series.push(obj)
	let option = getBarOption(legendData,title,legendColor,xAixs,yAxis,series)
	return option
}
export const resolveKData=(data:any,generatedata:any,interval:number,title:any,legendData:any,maxInterVal:any,show?:boolean,minInterVal?:number)=>{
	const {xData,ax,yData,arr,titles} = commonFun2(data,generatedata)
	let datainfo = arr.map((item:any)=>item.kData)
	// let lineData = yData[0]
	let xAxis = getXDataInfo(xData.reverse(),ax)
	var data = echarts.dataTool.prepareBoxplotData(datainfo);
	let option = {
    title: [
        {
            text: title,
						left: 'center',
						padding:25
        },
		],
		grid:{
			x: 100, 
			x2: 20,
			y2:65
		 },
		legend:{show:false},
    tooltip: {
        trigger: 'item',
        axisPointer: {
            type: 'shadow'
        }
    },
    color:legendColor,
    xAxis: xAxis,
    yAxis: {
				type: 'value',
				max: maxInterVal,
				min:minInterVal||0,
				interval: interval,
    },
    series: [
        {
						show:show?show:false,
            name: 'boxplot',
            type: 'boxplot',
            data: data.boxData,
            tooltip: {
                formatter: function (param:any) {
									let str = ""
									if(xData[0]){
										str+="①"+xData[0][param.dataIndex]
									}
									if(xData[1]){
										str+="<br/>"+"②"+xData[1][param.dataIndex]
									}
									if(xData[2]){
										str+="<br/>"+"③"+xData[2][param.dataIndex]
									}
                    return [
												str +  ': ' ,
                        '最大值: ' + Number(param.data[5].toFixed(2)),
                        // 'Q3: ' + param.data[4],
                        '中值: ' + Number(param.data[3].toFixed(2)),
                        // 'Q1: ' + param.data[2],
                        '最小值: ' + Number(param.data[1].toFixed(2))
                    ].join('<br/>');
                }
            }
        },
        {
            name: 'outlier',
            type: 'scatter',
            data: data.outliers
				}
				// {
				// 	data: lineData,
				// 	type: 'line'
				// }
    ]
	}
	return option
	
}
/**
 * 餅圖，玫瑰圖，雷達圖當前實現邏輯：
	1.根據數據篩選條件請求接口返回所有符合條件數據
	2.先統計出不良品的（isDefect=1）總個數
	3.然後對isDefect=1的數據根據defectName字段分組，求出每一組的條數
	4.如果條件選的“數值”，統計出每一組的條數展示數據即可，如果是“比率”則計算每一組的條數/不良總條數佔比，展示即可
	注意：當前，只有條件是“外觀-不良品”時，才可套用此邏輯
*/
export const resolvePieData=(generatedata:any,title:any,legendColor:any,data:any,show?:boolean)=>{
	let allcount = generatedata.length
	//統計出不良品的（isDefect=1）數據
	let isDefect1Data = generatedata.filter((item:any)=>item.isDefect === 1)
	let arrs:Array<string> = []
	let arrs2:Array<any> = []
	// 然後對isDefect=1的數據根據defectName字段分組，求出每一組的條數
	for(let i=0;i<isDefect1Data.length;i++){
		let item = isDefect1Data[i];
		let defectNameCh = item.defectNameCh;
		if(!arrs.includes(defectNameCh)){
			arrs.push(defectNameCh)
			let obj = {name:defectNameCh,value:1,bad:0}
			obj.bad = Number((obj.value/allcount).toFixed(2))
			arrs2.push(obj)
		}else{
			let index = arrs.findIndex(f=>f === defectNameCh)
			if(index>-1){
				arrs2[index].value+=1
			}
		}
	}
	let TOP = data.chartType.rankValue;
	let arrssort2 = arrs2.sort((a:any,b:any)=>b.value - a.value)
	if(TOP){
		arrssort2 = arrssort2.filter((f,index)=>index<TOP)
	}
	let TOPArr2 = arrssort2
	let arrs2Names = TOPArr2.map(item=>item.name)
	let option = {
		title: {
			text: title,
			left: 'center',
		
	},
    tooltip: {
        trigger: 'item',
				// formatter: '{a} <br/>{b}: {c} ({d}%)'
				formatter:(params:any)=>{
					let per = ((params.value/allcount)*100).toFixed(2)+"%"
					return params.seriesName+'<br/>'+params.marker+" "+params.name+":"+params.value+"("+params.percent+"%"+")"+'<br/>'+"不良/總數："+per
				}
    },
    legend: {
        orient: 'vertical',
				left: 10,
				type: 'scroll',
        data: arrs2Names
    },
    series: [
        {
					// legendData[0]
            name: "不良品",
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
                show: show?show:false,
                // position: 'center'
            },
						data: TOPArr2,
						// color:legendColor
        }
    ]
};
return option

}

export const resolveRoseData=(generatedata:any,title:any,legendColor:any,data:any,show?:boolean)=>{
	let allcount = generatedata.length
	//統計出不良品的（isDefect=1）數據
	let isDefect1Data = generatedata.filter((item:any)=>item.isDefect === 1)
	let arrs:Array<string> = []
	let arrs2:Array<any> = []
	// 然後對isDefect=1的數據根據defectName字段分組，求出每一組的條數
	for(let i=0;i<isDefect1Data.length;i++){
		let item = isDefect1Data[i];
		let defectNameCh = item.defectNameCh;
		if(!arrs.includes(defectNameCh)){
			arrs.push(defectNameCh)
			let obj = {name:defectNameCh,value:1,bad:0}
			obj.bad = Number((obj.value/allcount).toFixed(2))
			arrs2.push(obj)
		}else{
			let index = arrs.findIndex(f=>f === defectNameCh)
			if(index>-1){
				arrs2[index].value+=1
			}
		}
	}
	let TOP = data.chartType.rankValue;
	let arrssort2 = arrs2.sort((a:any,b:any)=>b.value - a.value)
	if(TOP){
		arrssort2 = arrssort2.filter((f,index)=>index<TOP)
	}
	let TOPArr2 = arrssort2
	let arrs2Names = TOPArr2.map(item=>item.name)

	// let arrs2Names = arrs2.map(item=>item.name)
	let option = {
		title: {
			text: title,
			left: 'center',
		
	},
    tooltip: {
        trigger: 'item',
				// formatter: '{a} <br/>{b}: {c} ({d}%)'
				formatter:(params:any)=>{
					let per = ((params.value/allcount)*100).toFixed(2)+"%"
					return params.seriesName+'<br/>'+params.marker+" "+params.name+":"+params.value+"("+params.percent+"%"+")"+'<br/>'+"不良/總數："+per
				}
    },
    legend: {
        orient: 'vertical',
				left: 10,
				type: 'scroll',
        data: arrs2Names
    },
    series: [
        {
					// legendData[0]
            name: "不良品",
						type: 'pie',
						roseType: 'radius',
            // radius: ['50%', '70%'],
            // avoidLabelOverlap: false,
            label: {
                show: show?show:false,
                // position: 'center'
            },
						data: TOPArr2,
						// color:legendColor
        }
    ]
};
return option

}
const getArr=(data:any)=>{
	let arrs:Array<string> = []
	let arrs2:Array<any> = []
	for(let i=0;i<data.length;i++){
		let item = data[i];
		let defectNameCh = item.defectNameCh;
		if(!arrs.includes(defectNameCh)){
			arrs.push(defectNameCh)
			let obj = {name:defectNameCh,max:1}
			arrs2.push(obj)
		}else{
			let index = arrs.findIndex(f=>f === defectNameCh)
			if(index>-1){
				arrs2[index].max+=1
			}
		}
	}
	return arrs2
}
export const resolveSpiderData=(generatedata:any,title:any,legendColor:any,data:any,show?:Boolean)=>{
	// let allcount = generatedata.length
	//統計出不良品的（isDefect=1）數據
	let isDefect1Data = generatedata.filter((item:any)=>item.isDefect === 1)
	let arrs2 = getArr(isDefect1Data)
	arrs2 = arrs2.sort((a:any,b:any)=>{
		return b.max-a.max;
	})
	let max = 0
	let maxs = arrs2.map(item=>item.max)
	maxs.sort(function (a:any, b:any) {
		return b-a;
	});
	let TOP = data.chartType.rankValue;
	if(TOP){
		arrs2 = arrs2.filter((f,index)=>index<TOP)
	}
	max = maxs?.length>0?maxs[0]:0
	let arrs1 = arrs2.map(item=>{return {name:item.name,max:max}})
	let spiderSeriesData = arrs2.map(item=>item.max)

	let arrs2Names = arrs2.map(item=>item.name)
	let option = {
    title: {
			text: title,
			left: 'center',
		
	},
    tooltip: {},
    legend: {
        data: arrs2Names
    },
    radar: {
        name: {
            textStyle: {
                color: '#fff',
                backgroundColor: '#999',
                borderRadius: 3,
                padding: [3, 5]
            }
        },
				indicator: arrs1.length?arrs1:[{name:"",max:0}]
    },
    series: [{
        type: 'radar',
        data: [
            {
                value: spiderSeriesData,
                name: ''
            }
				],
				show:show?show:false
    }]
};
return option

}
//獲取x軸，y軸坐標上的value組成的數組
const getMyPosition=(xAxis:any,yAxis:any,pointValue:any)=>{
	let arr:any = []
	for(let i=0;i<yAxis.length;i++){
		for(let j=0;j<xAxis.length;j++){
			let index = i*xAxis.length+j
			let value = pointValue[index]
			if(value){
				arr.push([i,j,value])
			}
		}
	}
	return arr
}
const getMapArr=(arr:any)=>{
	return Array.from(new Set(arr))
}
export const resolveHeatMapData=(generatedata:any,title:any,legendColor:any,data:any,show?:Boolean)=>{
	if(!generatedata||!generatedata.length){}
	//將partSn和pointNo作為橫縱坐標
	let allpartSn = getMapArr(generatedata.map((item:any)=>item.partSn))
	let allPointNo = getMapArr(generatedata.map((item:any)=>item.pointNo))
	// var xAxis = ['', '', '', '', '', '', '','', '', '','','','', '', '', '', '', '','', '', '', '', '', ''];
	// var yAxis = ['', '', '','', '', '', ''];
	var xAxis = allPointNo.map((item:any)=>'')
	var yAxis = allpartSn
	let obj = generatedata[0];
	let keys = Object.keys(obj)
	if(!keys.includes("pointValue")){
		return {}
	}
	let pointValue = generatedata.map((item:any)=>item.pointValue)
	let maxValue = Math.max(...pointValue)
	let minValue = Math.min(...pointValue)
	let midValue = (maxValue+minValue)/2

	let zero = 0;
	let colorArr = [
		{
			gte: minValue,
			lte: midValue,
			color: '',
		},
		{
			gte: midValue,
			lte: maxValue,
			color: '',
		},
	];
	//zero是最大值
	if(zero>maxValue){
		let max:any = {
			gte: maxValue,
			lte: zero
		}
		colorArr.push(max)
	}
	else if(zero<maxValue&&zero>midValue){
		let mid:any = {
			gte: midValue,
			lte: zero,
		}
		let temp = colorArr[1]
		colorArr[2] = temp
		colorArr[1] = mid
	}else{
		let min:any = {
			gte: minValue,
			lte: zero,
		}
		colorArr.unshift(min)
	}
	colorArr[0].color = '#ffe371'
	colorArr[1].color = '#d7b100'
	colorArr[2].color = '#836900'


	let names = generatedata.map((item:any)=>item.partSn+"("+item.pointNo+")")
	let myPosition = getMyPosition(xAxis,yAxis,pointValue)
	//坐標
	var data:any = myPosition;
	let seriesData = data.map(function (item:any) {
			return [item[1], item[0], item[2] || '-'];
	});
let option = {
		title:{
			text: title,
			left: 'center'
		},
    tooltip: {
        position: 'top',
    },
    grid: {
        height: '85%',
        top: '5%',
				left:'15%'
    },
    xAxis: {
        type: 'category',
        data: xAxis,
				show:false,
        splitArea: {
            show: true
        },
				axisLabel:{
					interval:0,
					rotate:30
				}
    },
    yAxis: {
				show:false,
        type: 'category',
        data: yAxis,
        splitArea: {
            show: true
        }
    },
    visualMap: {
				precision: 3,
        min: minValue,
        max: maxValue,
        // calculable: true,
        // orient: 'horizontal',
        left: 'left',
        // bottom: '15%'
        pieces: colorArr,
    },
    series: [{
        type: 'heatmap',
        data: seriesData,
        label: {
            show: show,
						textStyle:{
							fontSize:8
						}
        },
        emphasis: {
            itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
								fontSize:20
            }
        },
				tooltip: {
					formatter: function (param:any) {
						let index = param?.dataIndex
						let name = ''
						if(index>-1){
							name = names[index]
						}
						return param.marker+name+'<br/>'+param.value[2]
					}
			}
    }]
};
return option
}
export const resolvePointData=(generatedata:any,title:any,legendColor:any,data:any,show?:Boolean)=>{
	if(!generatedata||!generatedata?.length){
		return {}
	}
	let arr = []
	for(let i=0;i<generatedata.length;i=i+2){
		//第一個為x軸，第二個為y軸
		let x = generatedata[i].pointValue
		let y = generatedata[i+1]?.pointValue
		let partSn = generatedata[i].partSn
		arr.push([x,y,partSn])
	}
	let allX = arr.map((item:any)=>Number(item[0]))
	let allY = arr.map((item:any)=>Number(item[1]))
	let maxX = Math.max(...allX)
	let minX = Math.min(...allX)
	let maxY = Math.min(...allY)
	let minY = Math.min(...allY)
	var data:any = arr
	let option = {
		title:{
			text: title,
			left: 'center'
		},
    dataset: [{
        source: data
    }],

    xAxis: {
			min:minX,
			max:maxX,
        splitLine: {
            lineStyle: {
                //type: 'dashed'
            }
        },
        // splitNumber: 20
    },
    yAxis: {
			min:minY,
			max:maxY===minY?maxY*1.001:maxY,
        splitLine: {
            lineStyle: {
                type: 'dashed'
            }
        }
    },
    series: [
        {
				// name: 'scatter1',
        type: 'scatter',
				// symbolSize: 1,
				color:"#16bd3d",
        label:{
            show:show,
            formatter:(params:any)=>{
                return params.value[2]
            }
        },
			// 	tooltip: {
			// 		formatter: function (params:any) {
			// 			return '測試'
			// 			return params[0].marker+params[0].value[2]+"("+params[0].value[0]+","+params[0].value[1]+")"
			// 		}
			// }
        },
        ],
				tooltip: {
					trigger: 'axis',
					axisPointer: {
							type: 'cross'
					},
					formatter:(params:any)=>{
							return params[0].marker+params[0].value[2]+"("+params[0].value[0]+","+params[0].value[1]+")"
					}
			},
};
return option
}

export const getPropertion=(storeState:any)=>{
	let rate = storeState.filterReducer.rate
	let proportion = 1.2
	if(rate === '比率'){
		proportion = 1
	}
	return proportion
}
const getCurrentCount=(arrJ:any,generatedata:any)=>{
	let data = getFilterData(generatedata,arrJ)
	let count = data.length;
	return count
}
const getCurrentCountNG=(arrJ:any,generatedata:any)=>{
	// let data = getFilterData(generatedata,arrJ)
	// let count = data.length;
	// return count
	let filterData = generatedata.filter((item:any)=>(item.levelName1||'NG') === arrJ.levelName1)
	let filterData2 = filterData.filter((item:any)=>(item.levelName2||"NG") === arrJ.levelName2)
	let filterData3 = filterData2.filter((item:any)=>(item.levelName3||"NG") === arrJ.levelName3)
	//1和2的差集
	// let distinct2 = [...filterData].filter(x => [...filterData2].every(y => y.partSn !== x.partSn));
	// console.log("差集",distinct2)
	return filterData3.length
}
export default getMyOption;