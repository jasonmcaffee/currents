import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TodoItem from './TodoItem'
import Footer from './Footer'

const SHOW_ALL = 'show_all'
const SHOW_COMPLETED = 'show_completed'
const SHOW_ACTIVE = 'show_active'

const TODO_FILTERS = {
  [SHOW_ALL]: () => true,
  [SHOW_ACTIVE]: todo => !todo.completed,
  [SHOW_COMPLETED]: todo => todo.completed
}

export default class MainSection extends Component {

  constructor(props){
    super(props);
    const {todos, todosCurrents, mainSectionModel} = props;
    this.state = {todos, mainSectionModel}; // store todosModel in state so that we can setState when changed, and re-render.
    this.listen({todosCurrents});
  }

  listen({todosCurrents}){
    const self = this;
    this.offs = [
      todosCurrents.changed().on(todos => self.setState({todos})),
    ];
  }
  componentWillUnmount(){
    console.log(`MainSection unmounting. calling offs`);
    this.offs.forEach(off=>off());
  }

  //todo: use toggle state rather than this current implementation.
  renderToggleAll() {
    const {todosCurrents} = this.props;
    const {todos} = this.state;
    if (todos.length > 0) {
      return (
        <span>
          <input className="toggle-all" type="checkbox" checked={todos.every(t=>t.completed)}/>
          <label onClick={()=>todosCurrents.toggle().fire()}/>
        </span>
      )
    }
  }

  renderFooter() {
    const { todosCurrents, footerModel } = this.props;

    return (
      <Footer footerModel={footerModel} todosCurrents={todosCurrents} />
    );
  }

  render() {
    const { todosCurrents } = this.props;
    const { todos } = this.state;
    return (
      <section className="main">
        {this.renderToggleAll()}
        <ul className="todo-list">
          {todos.map(todo =>
            <TodoItem key={todo.id} todo={todo} todosCurrent={todosCurrents} />
          )}
        </ul>
        {this.renderFooter()}
      </section>
    )
  }
}