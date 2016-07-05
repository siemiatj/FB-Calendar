import React, { Component } from 'react';
import v4 from 'node-uuid';

class Timeline extends Component {
  buildLis() {
    let times = [ 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    let list = [];
    let i = 0;

    while (i < 25) {
      let time = times[i];
      let suffix = 'PM';
      let className = 'major';
      let p = null;

      if (i < 3) {
        suffix = 'AM';
      }

      if (i % 2) {
        className = 'minor';
        p = (<p>{time}:30 {suffix}</p>);

        times.splice(i, 0, time);
      } else {
        p = (<p><span className="bold">{time}:00</span> {suffix}</p>);
      }

      list.push(
        <li className={className} key={v4()}>
        {p}
        </li>
      );

      i++;
    }

    return list;
  }

  render() {
    let elements = this.buildLis();

    return (
      <ul>
        { elements }
      </ul>
    );
  }
}

export default Timeline;
