import React, {Component} from 'react';

require('./App.css');
require('todomvc-app-css/index.css');
import Header from './Header';
import MainSection from './MainSection';
import StoreCurrent from '../models/StoreCurrent';

const storeCurrent = new StoreCurrent();
const todosCurrent = storeCurrent.todos;

export default class App extends Component{
  constructor(){
    super();
  }

  render(){
    return (
      <div>
        <Header todosCurrent={todosCurrent} />
        <MainSection todos={storeCurrent.store.todos} todosCurrent={todosCurrent} />
      </div>
    );
  }
}
