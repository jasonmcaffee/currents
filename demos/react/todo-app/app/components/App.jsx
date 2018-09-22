import React, {Component} from 'react';

require('./App.css');
require('todomvc-app-css/index.css');
import Header from './Header';
import MainSection from './MainSection';
import Store from '../models/Store';

const store = new Store();
const todosCurrents = store.currents.todos;

export default class App extends Component{
  constructor(){
    super();
  }

  render(){
    return (
      <div>
        <Header todosCurrent={todosCurrents} />
        <MainSection todos={store.todos} mainSectionModel={store.mainSectionModel} footerModel={store.footerModel} todosCurrents={todosCurrents} />
      </div>
    );
  }
}
