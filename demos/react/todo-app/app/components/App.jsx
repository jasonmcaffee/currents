import React, {Component} from 'react';

require('./App.css');
require('todomvc-app-css/index.css');
import Header from './Header';
import MainSection from './MainSection';
import Store from '../models/Store';

const store = new Store();
const todosCurrent = store.currents.todos;

export default class App extends Component{
  constructor(){
    super();
  }

  render(){
    return (
      <div>
        <Header todosCurrent={todosCurrent} />
        <MainSection todos={store.todos} todosCurrent={todosCurrent} />
      </div>
    );
  }
}
