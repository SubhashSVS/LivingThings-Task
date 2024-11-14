const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const dataSchema = new mongoose.Schema({
  createdAt: {
    $date: {
      type: Date,
    }
  },
  serialNo: String,
  total_kwh: Number,
  clientID: {
    $oid: {
      type: String,
    }
  },
  deviceMapID: {
    $oid: {
      type: String,
    }
  },
  devices: [{
    $oid: {
      type: String
    }
  }],
  updatedAt: {
    $date: {
      type: Date,
    }
  },
  ac_run_hrs: Number,
  ac_fan_hrs: Number,
  algo_status: Number,
  billing_ammount: Number,
  cost_reduction: Number,
  energy_savings: {
    savings_percent: Number,
    ref_kwh: Number,
    us_meter: Number,
    us_calc: Number,
    inv_factor: Number
  },
  mitigated_co2: Number,
  weather: {
    max_temp: Number,
    min_temp: Number
  }
}, { collection: 'data' });

const Data = mongoose.model('Data', dataSchema);

const logsSchema = mongoose.Schema({
  name : String,
  date : String,
  time : String
})

const Logs = mongoose.model('logs',logsSchema);

app.get('/data', async (req, res) => {
  const { filter } = req.query;

  const initialData = await Data.find({
    algo_status : filter
  }, 'createdAt total_kwh');
  
  const totalKwHPerDate = initialData.reduce((acc, entry) => {
    const date = entry.createdAt;
    const kwH = entry.total_kwh;
  
    if (acc[date]) {
      acc[date] += kwH;
    } else {
      acc[date] = kwH;
    }
  
    return acc;
  }, {});
  
  const result = Object.entries(totalKwHPerDate).map(([date, total_kwh]) => ({
    date,
    total_kwh
  }));  

  res.json(result);

});

app.post('/log',async (req,res)=>{
  const body = req.body;
  const logDate = new Date();

  const datePart = logDate.toISOString().split('T')[0];
  const timePart = logDate.toISOString().split('T')[1].split('.')[0];

  const log = new Logs({
    name : body.name,
    date : datePart,
    time : timePart
  });

  await log.save();
  res.json({message : "Log created"});
})

app.get('/logs',async (req,res)=>{
  const response = await Logs.find({});
  res.json(response);
})

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});