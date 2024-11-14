import { useState } from "react";
import axios from 'axios';

import Graph from "./Graph";

const url = import.meta.env.VITE_API_URL;

export function Form(){
    const [name,setName] = useState("");
    const [filter,setFilter] = useState("")
    const [data, setData] = useState([]);
    const [logs,setLogs] = useState([]);
    
    const applyFilter = async ()=>{
        const response =  await axios.get(`${url}/data`,{
            params : {
                filter : filter
            }
        });

        const processedData = response.data.map(item => ({
            date: new Date(item.date).toLocaleDateString(),
            total_kwh: item.total_kwh
        }));

        setData(processedData);

        await axios.post(`${url}/log`,{
            name : name
        })

        const res = await axios.get(`${url}/logs`);
        setLogs(res.data);

        setName("");
        setFilter("");
    }

    return(
        <div className="">
            <div className="p-10 flex flex-col gap-y-8 items-center justify-center">  
                <div className="font-bold text-4xl">Bar Chart of Energy Consumption</div>   
                <div className="flex gap-x-4">
                    <div className="text-xl">
                        Name  :
                    </div>
                    <input 
                        type="text"
                        value={name}
                        onChange={(e)=>{
                            setName(e.target.value);
                        }}
                        className=" border border-black p-2 rounded-md"
                    /> 
                </div>   
                <div className="flex gap-x-6">
                    <label className="text-xl">Filter :</label>
                    <select
                        className="px-5 py-2 rounded-md"
                        value={filter}
                        onChange={(e)=>{
                            setFilter(e.target.value);
                        }}
                    >
                        <option value="">Choose an option</option>
                        <option value="0">Energy Saving Mode ON</option>
                        <option value="1">Energy Saving Mode OFF</option>
                    </select>
                </div>    
                <div>
                    <button 
                        className="text-white bg-black font-bold px-10 py-2 rounded-md"
                        onClick={applyFilter}
                    >
                        Submit
                    </button>
                </div>
                {                    
                    data.length > 0 && <Graph data={data} /> 
                }
                <div className="my-4">
                    <div className="font-bold text-2xl mb-4">Logs : </div>
                    <div className="grid grid-cols-3 gap-x-4 p-2 text-lg font-semibold border border-black" >
                            <div>Name</div>
                            <div>Date(yyyy/mm/dd)</div>
                            <div>Time(hh:mm:ss)</div>
                    </div>
                    {
                        logs.map((log)=>(
                            <div className="grid grid-cols-3 gap-x-4 p-2 text-md border border-black" >
                                <div>
                                    {log.name} 
                                </div>
                                <div>
                                    {log.date} 
                                </div>
                                <div>
                                    {log.time}
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}