import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import TodoTextInput from './TodoTextInput'

export default class TodoItem extends Component {
  state = {
    editing: false
  }

  handleDoubleClick = () => {
    this.setState({ editing: true });
  }

  handleSave = (todo, text) => {
    const {todosCurrent} = this.props;
    if (text.length === 0) {
      todosCurrent.deleteTodo().fire(todo);
    } else {
      todosCurrent.editTodo().fire({todo, text});//cant do this. 1 param.
    }
    this.setState({ editing: false })
  }

  render() {
    const { todo, todosCurrent } = this.props;

    let element;
    if (this.state.editing) {
      element = (
        <TodoTextInput text={todo.text} editing={this.state.editing} onSave={(text) => this.handleSave(todo, text)} />
      )
    } else {
      element = (
        <div className="view">
          <input className="toggle" type="checkbox" checked={todo.completed} onChange={() => todosCurrent.completeTodo().fire(todo)} />
          <label onDoubleClick={this.handleDoubleClick}>
            {todo.text}
          </label>
          <button className="destroy" onClick={() => todosCurrent.deleteTodo().fire(todo)} />
        </div>
      )
    }

    return (
      <li className={classnames({completed: todo.completed, editing: this.state.editing})}>
        {element}
      </li>
    )
  }
}