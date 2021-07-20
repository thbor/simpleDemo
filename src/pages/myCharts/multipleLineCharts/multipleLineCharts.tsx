import React, { useState } from 'react';
import ReactEcharts from 'echarts-for-react';
import { useEffect } from 'react';
import getMyOption from './utils';

const filterCondition = require('./filter');
const chartsJson = require('./chart');

const multipleLineCharts=()=>{
  const [echart1,setEchart1] = useState(null)
	const [e1,setE1] = useState({})

  const option  = getMyOption(filterCondition,chartsJson);
  const getEcharts = (e: any) => {
		if (!!e) {
			setE1(e);
			if(Object.keys(e).length !== 0){
				let eInstance = e?.getEchartsInstance()
				if(eInstance){
					setEchart1(eInstance)
				}
			}
			}
	}
  return (
    <>
    <ReactEcharts option={option} style={{width:'100%',height:'300px'}} 
					 ref={(e: any) => {!echart1&&getEcharts(e)}} // 获取eChart组件实例
					/>
    </>
  )
}
export default multipleLineCharts;