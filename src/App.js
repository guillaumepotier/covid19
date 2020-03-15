import React from 'react';
import TextField from '@material-ui/core/TextField';
import {
  BarChart,
  ResponsiveContainer,
  AreaChart,
  Area,
  linearGradient,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar
} from 'recharts';

import './App.css';

const INITIAL_ILL = 2000;
const INITIAL_REMITTED = 200;
const INITIAL_DEAD = 50;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      timespanDays: 180,
      population: 67000000,
      dailyContacts: 40,
      transmissionProbability: 0.5,
      illnessDuration: 10,
      averageMortalityRate: 2,
      totalAvailableBeds: 15000,
      increasingMortalityRate: 1
    };
  }

  generateData () {
    const data = {
      days: [0],
      total_healthy: [this.state.population - INITIAL_ILL],
      total_ill: [INITIAL_ILL],
      total_deceased: [INITIAL_DEAD],
      total_incr_deceased: [0],
      total_remitted: [INITIAL_REMITTED],
      daily_ill: [INITIAL_ILL],
      daily_deceased: [INITIAL_DEAD],
      daily_remitted: [0]
    };

    for (let day = 1; day <= this.state.timespanDays; day++) {

      const ill = Math.round(
        data.total_ill[day-1] * (
          1
          + this.state.dailyContacts * this.state.transmissionProbability / 100 * data.total_healthy[day-1] / this.state.population
          - 1/this.state.illnessDuration
          - this.state.averageMortalityRate / 100 / this.state.illnessDuration
        )
      );

      const normalyDeceased = Math.round(data.total_deceased[day-1] + this.state.averageMortalityRate / 100 / this.state.illnessDuration * ill);
      const deceased = Math.round(data.total_deceased[day-1] + (ill > this.state.totalAvailableBeds ? this.state.averageMortalityRate + this.state.increasingMortalityRate : this.state.averageMortalityRate) / 100 / this.state.illnessDuration * ill);
      const incrDeceased = data.total_incr_deceased[day-1] + deceased - normalyDeceased;

      const remitted = Math.round(data.total_remitted[day-1] + (1 / this.state.illnessDuration) * ill);
      const healthy = Math.round(this.state.population - ill - deceased - remitted);

      data.days.push(day);

      data.total_healthy.push(healthy);
      data.total_ill.push(ill);
      data.total_deceased.push(deceased);
      data.total_incr_deceased.push(incrDeceased);
      data.total_remitted.push(remitted);

      data.daily_ill.push(Math.max(0, ill - data.total_ill[day - 1]));
      data.daily_deceased.push(Math.max(0, deceased - data.total_deceased[day - 1]));
      data.daily_remitted.push(Math.max(0, remitted - data.total_remitted[day - 1]));
    }

    return data;
  }

  generateChartData (data, fields) {
    const chartData = [];

    for (let day = 0; day < data.days.length; day++) {
      const item = {};

      for (let i = 0; i < fields.length; i++)
        item[fields[i]] = data[fields[i]][day];

      chartData.push(item);
    }

    return chartData;
  }

  formatHumanReadableNumber (number) {
    return String(number).replace(/(.)(?=(\d{3})+$)/g,'$1 ');
  }

  render () {
    const data = this.generateData();
    const chartData1 = this.generateChartData(data, ['days', 'total_healthy', 'total_ill', 'total_deceased']);
    const chartData2 = this.generateChartData(data, ['days', 'daily_ill', 'daily_remitted', 'daily_deceased']);

    console.log(data);

    return (
      <div className="App">
        <div className="Parameters">

          <TextField label={`Simulation timespan (days)`} type="number" value={this.state.timespanDays} onChange={e => this.setState({ timespanDays: e.target.value })} />
          <TextField label={`Total population`} type="number" value={this.state.population} onChange={e => this.setState({ population: e.target.value })} />
          <TextField label={`Daily distinct contacts`} type="number" value={this.state.dailyContacts} onChange={e => this.setState({ dailyContacts: e.target.value })} />
          <TextField label={`Transmission probability (%)`} type="number" value={this.state.transmissionProbability} onChange={e => this.setState({ transmissionProbability: e.target.value })} />
          <TextField label={`Illness duration (days)`} type="number" value={this.state.illnessDuration} onChange={e => this.setState({ illnessDuration: e.target.value })} />
          <TextField label={`Average mortality rate (%)`} type="number" value={this.state.averageMortalityRate} onChange={e => this.setState({ averageMortalityRate: e.target.value })} />
          <TextField label={`Available hospital beds`} type="number" value={this.state.totalAvailableBeds} onChange={e => this.setState({ totalAvailableBeds: e.target.value })} />
          <TextField label={`Avg mortality rate incr (%)`} type="number" value={this.state.increasingMortalityRate} onChange={e => this.setState({ increasingMortalityRate: e.target.value })} />

        </div>

        <div className="Data">
          <h5>Total deceased: {this.formatHumanReadableNumber(data.total_deceased[data.total_deceased.length - 1])} (incl. {this.formatHumanReadableNumber(data.total_incr_deceased[data.total_incr_deceased.length - 1])})</h5>
        </div>

        <div className="Graphs">

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData1}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHealthy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorIll" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDead" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff5e5e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ff5e5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="days" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="total_healthy" stroke="#8884d8" fillOpacity={1} fill="url(#colorHealthy)" />
              <Area type="monotone" dataKey="total_ill" stroke="#82ca9d" fillOpacity={1} fill="url(#colorIll)" />
              <Area type="monotone" dataKey="total_deceased" stroke="#ff5e5e" fillOpacity={1} fill="url(#colorDead)" />
            </AreaChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData2}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="days" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="daily_ill" fill="#8884d8" />
              <Bar dataKey="daily_remitted" fill="#82ca9d" />
              <Bar dataKey="daily_deceased" fill="#ff5e5e" />
            </BarChart>
          </ResponsiveContainer>

        </div>

        <div className="Disclaimer">Inspired by <a href="https://sciencetonnante.wordpress.com/2020/03/12/epidemie-nuage-radioactif-et-distanciation-sociale/">this article (FR).</a></div>
      </div>
    );
  }
}

export default App;
