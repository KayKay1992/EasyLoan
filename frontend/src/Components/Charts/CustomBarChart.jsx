import React from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,CartesianGrid, Tooltip,ResponsiveContainer, Cell,Legend
} from 'recharts'
import BarCustomLegend from './BarCustomLegend';



const CustomBarChart = ({data}) => {

    //function to alternate colors
    const getBarColor = (entry) => {
        switch(entry?.loanType){
            case 'personal': return '#FF1F57'
            case 'business': return '#FE9900'
            case 'student': return '#00BC11'
            case 'mortgage': return '#7e22ce'
            case 'car loan': return '#9eb333'
            case 'quickie loan': return '#0056'
            default :
              return '#00BC7D'
        }
    };

    const CustomToolTip = ({active, payload}) => {
        if(active &&  payload && payload.length){
            return (
                <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
                    <p className="text-xs font-semibold text-purple-800 mb-1 ">{payload[0].payload.loanType}</p>
                    <p className="text-sm text-gray-600">
                        Count: <span className="text-sm font-medium text-gray-900">
                            {payload[0].payload.count}
                        </span>
                    </p>
                </div>
            )
           }
           return null
    }
 
  return (
       <div className="bg-white mt-6 ">
        <ResponsiveContainer width='100%' height={300}>
            <BarChart data={data}>
                <CartesianGrid stroke='none'/>

                <XAxis dataKey='loanType' tick={{fontSize: 12, fill: '#555'}} stroke='none'/>
                <YAxis tick={{fontSize: 12, fill: '#555'}} stroke='none'/>
                <Tooltip content={CustomToolTip} cursor={{fill: 'transparent'}}/>

                <Legend
      content={<BarCustomLegend />}
      payload={data.map((entry) => ({
        value: entry.loanType,
        type: 'square',
        color: getBarColor(entry),
      }))}
    />
               
                <Bar dataKey='count' nameKey='loanType'  fill='#FF8042' radius={[10,10,0,0]} activeDot={{r: 8, fill: 'yellow'}} activeStyle={{fill: 'green'}}>
                    {data.map((entry,index)=>(
                        <Cell key={index} fill={getBarColor(entry)}/>
                    ))}
                </Bar>
               
            </BarChart>
        </ResponsiveContainer>
       </div>
  )
}

export default CustomBarChart