import {load} from './timeTable.js';
console.log(123)

const ct= [
  [8, 0],
  [9, 20],
  [10, 20],
  [11, 20],
  [12, 20],
  [14, 0],
  [15, 0],
  [16, 0]
]
const calcul = () => {
  const durations = [];
  for(let i=1;i<ct.length;i++)
    durations.push(
      (ct[i][0] - ct[i-1][0])*60 + ct[i][1] - ct[i-1][1]);
  return durations;
}

console.log(calcul())

load()