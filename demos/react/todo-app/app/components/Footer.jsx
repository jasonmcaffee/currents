import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default class Footer extends Component {
  constructor(props){
    super(props);
    this.state = this.props.footerModel;
    const {footerModelCurrents} = this.state;
    this.listen({footerModelCurrents});
  }

  listen({footerModelCurrents}){
    const self = this;
    this.offs = [
      footerModelCurrents.changed().on(footerModel=>{
        console.log(`Footer.jsx received change for footerModel: `, footerModel);
        self.setState(footerModel);
      }),
    ];
  }
  componentWillUnmount(){
    this.offs.map(off=>off());
  }
  renderTodoCount() {
    const {itemsLeftLabel, itemsLeftCount} = this.state;
    return (
      <span className="todo-count">
        <strong>{itemsLeftCount}</strong> {itemsLeftLabel}
      </span>
    );
  }

  renderFilterLink(filter) {
    const {label, action} = filter;
    const {selectedFilterLabel} = this.state;
    return (
      <a className={classnames({ selected: filter.label === selectedFilterLabel })} style={{ cursor: 'pointer' }} onClick={action}>
        {label}
      </a>
    );
  }

  renderClearButton() {
    const {showClearCompletedButton} = this.state;
    const {todosCurrent} = this.props;
    if(!showClearCompletedButton){ return; }
    return (
      <button className="clear-completed" onClick={()=>todosCurrent.clearCompleted().fire()} >
        Clear completed
      </button>
    );

  }

  render() {
    console.log(`Footer.jsx render`);
    const {filters, displayFooter} = this.state;
    if(!displayFooter){return null;}
    return (
      <footer className="footer">
        {this.renderTodoCount()}
        <ul className="filters">
          {filters.map(filter =>
            <li key={filter}>
              {this.renderFilterLink(filter)}
            </li>
          )}
        </ul>
        {this.renderClearButton()}
      </footer>
    )
  }
}