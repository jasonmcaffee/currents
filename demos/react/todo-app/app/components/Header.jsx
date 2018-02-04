import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TodoTextInput from './TodoTextInput'

export default class Header extends Component {
  // static propTypes = {
  //   todosCurrent: PropTypes.object.isRequired
  // }

  handleSave = text => {
    if (text.length !== 0) {
      this.props.todosCurrent.addTodo().fire({text});
    }
  }

  render() {
    return (
      <header className="header">
        <h1>todos</h1>
        <TodoTextInput newTodo
                       onSave={this.handleSave}
                       placeholder="What needs to be done?" />
      </header>
    )
  }
}