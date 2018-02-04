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
    const {todos} = props;
    this.state = {todos, filter: SHOW_ALL};
    this.listen();
  }
  listen(){
    const self = this;
    this.offs = [
      this.props.todosCurrent.changed().on(todos => self.setState({todos}))
    ];
  }
  componentWillUnmount(){
    console.log(`MainSection unmounting. calling offs`);
    this.offs.forEach(off=>off());
  }
  handleClearCompleted = () => {
    this.props.todosCurrent.clearCompleted().fire();
  }

  handleShow = filter => {
    this.setState({ filter });
  }

  renderToggleAll(completedCount) {
    const {todosCurrent} = this.props;
    const {todos} = this.state;

    if (todos.length > 0) {
      return (
        <span>
          <input className="toggle-all" type="checkbox" checked={completedCount === todos.length}/>
          <label onClick={()=>todosCurrent.completeAll().fire()}/>
        </span>
      )
    }
  }

  renderFooter(completedCount) {
    const { filter, todos } = this.state;
    const activeCount = todos.length - completedCount;

    if (todos.length) {
      return (
        <Footer completedCount={completedCount} activeCount={activeCount} filter={filter} onClearCompleted={this.handleClearCompleted} onShow={this.handleShow} />
      )
    }
  }

  render() {
    const { todosCurrent } = this.props;
    const { filter, todos } = this.state;

    const filteredTodos = todos.filter(TODO_FILTERS[filter])
    const completedCount = todos.reduce((count, todo) =>
        todo.completed ? count + 1 : count,
      0
    )

    return (
      <section className="main">
        {this.renderToggleAll(completedCount)}
        <ul className="todo-list">
          {filteredTodos.map(todo =>
            <TodoItem key={todo.id} todo={todo} todosCurrent={todosCurrent} />
          )}
        </ul>
        {this.renderFooter(completedCount)}
      </section>
    )
  }
}