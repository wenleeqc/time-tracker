import React from 'react';
import ReactDom from 'react-dom';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as Chartjs, ArcElement } from 'chart.js'
Chartjs.register(ArcElement);

class Chart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chartData: {
        labels: [],
        datasets: [
          {
            label: '',
            data: [],
            backgroundColor: [],
            borderWidth: 0
          }
        ]
      },
      isHidden: true,
    }
    this.getChartData = this.getChartData.bind(this);
  }

  componentDidMount() {
    this.getChartData();
  }

  getChartData() {
    //console.log(jsonData)

    // get json data from api
    const csv = this.props.csvData;
    console.log('in chart component: csv data from prop', csv)

    //console.log('json string', JSON.stringify(csv));

    fetch('http://localhost:8080/api')
      .then(res => res.json())
      .then(result => {
        //console.log('result',result)

        //return json array

        // helper function to sum up time data for each site visited
        const addTime = (obj) => {
          const values = Object.values(obj);
          let sum = 0;
          for (let i = 2; i < values.length; i++) {
            sum = sum + values[i];
          }
          return sum;
        }

        // build map of site and time spent
        let store = []; // data store
        result.forEach(element => {
          if (store[element['Domain']]) {
            // update new key
            // add time
            store[element['Domain']] = store[element['Domain']] + addTime(element);
          } else {
            // add new key
            // sum up time
            store[element['Domain']] = addTime(element);
          }
        })

        console.log('in chart component: complete map', store);

        // build array of key value pairs and sort from most visited to least visited
        const pairs = Object.entries(store).sort((a, b) => b[1] - a[1]);
        console.log('in chart component: key value pairs', pairs);

        // get portion of array and split to key and value arrays
        const numberOfSites = 5; // get top five visited sites
        console.log(`in chart component: top ${numberOfSites} sites`, pairs.slice(0, numberOfSites).map(e => e[0]));
        const sites = pairs.slice(0, numberOfSites).map(e => e[0]);
        const times = pairs.slice(0, numberOfSites).map(e => e[1]);

        // return site and time data
        return { sites, times };
      })
      .then(data => {
        //console.log('data sites',data.sites);

        // update state
        this.setState({
          chartData: {
            labels: data.sites,
            datasets: [
              {
                label: 'Websites Visited',
                data: data.times,
                backgroundColor: [
                  'rgba(214,45,94,.8)',
                  'rgba(231,123,85,.8)',
                  'rgba(250,222,156,.8)',
                  'rgba(77,219,185,.8)',
                  'rgba(142,139,255,.8)'
                ]
              }
            ]
          },
          isHidden: false
        });
      }) // end of fetch
  }

  render() {
    return (
      <div className="chart row mt-5">
        <div className="col-6">
          <h1 className="display-5 text-center text-white mb-5">Top 5 Visited Websites</h1>
          <Doughnut
            data={this.state.chartData}
            options={{}}
          />
        </div>
        <div className="col-6">
          <h1 className="display-6 text-white text-center"> Domains</h1>
          <ul className="list-group list-group-flush">
            <li className="list-group-item text-white" Style="background-color:rgba(214,45,94,.8)">buymeacoffee.com</li>
            <li className="list-group-item text-white" Style="background-color:rgba(231,123,85,.8)">cuny.edu</li>
            <li className="list-group-item text-white" Style="background-color:rgba(250,222,156,.8)">instagram.com</li>
            <li className="list-group-item text-white" Style="background-color:rgba(77,219,185,.8)">irs.gov</li>
            <li className="list-group-item text-white" Style="background-color:rgba(142,139,255,.8)">makeareadme.com</li>
          </ul>
        </div>
      </div>
    )
  }
}

export default Chart