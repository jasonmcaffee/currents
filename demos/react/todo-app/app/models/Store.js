import {Currents} from "currents";



export default class Store{
  constructor(){
    this.todos = [];
    this.currents = new Currents();
    this.listen();
  }

  listen(){
    this.currents.todos.addTodo().on(this.addTodo.bind(this));
    this.currents.todos.clearCompleted().on(this.clearCompleted.bind(this));
    this.currents.todos.completeAll().on(this.completeAll.bind(this));
    this.currents.todos.completeTodo().on(this.completeTodo.bind(this));
    this.currents.todos.deleteTodo().on(this.deleteTodo.bind(this));
    this.currents.todos.editTodo().on(this.editTodo.bind(this));
  }

  addTodo({id=generateRandomInt(), text, completed=false}){
    const todo = {text, completed};
    this.todos.push(todo);
    this.currents.todos.changed().fire(this.todos);
  }

  clearCompleted(){
    this.todos = this.todos.filter(todo => !todo.completed);
    this.currents.todos.changed().fire(this.todos);
  }

  completeAll(){
    this.todos.map(this.completeTodo.bind(this));
  }

  completeTodo(todo){
    todo.completed = true;
    this.currents.todos.changed().fire(this.todos);
  }

  deleteTodo(todo){
    const todoIndex = this.todos.indexOf(todo);
    this.todos.slice(todoIndex, 1);
    this.currents.todos.changed().fire(this.todos);
  }

  editTodo(todo, {text}){
    todo.text = text;
    this.currents.todos.changed().fire(this.todos);
  }
}

function generateRandomTodoId(){
  return `todo${Date.now()}${generateRandomInt()}`;
}
function generateRandomInt(max=1000000000) {
  return Math.floor(Math.random() * Math.floor(max));
}