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
    console.log(`store addTodo called: `, {id, text, completed});
    const todo = {text, completed};
    this.todos.push(todo);
    this.currents.todos.changed().fire(this.todos);
  }

  clearCompleted(){
    console.log(`store clearCompleted called`);
    this.todos = this.todos.filter(todo => !todo.completed);
    this.currents.todos.changed().fire(this.todos);
  }

  completeAll(){
    console.log(`store completeAll called`);
    this.todos.map(this.completeTodo.bind(this));
  }

  completeTodo(todo){
    console.log(`store completeTodo called`, todo);
    todo.completed = true;
    this.currents.todos.changed().fire(this.todos);
  }

  deleteTodo(todo){
    console.log(`store deleteTodo called`, todo);
    const todoIndex = this.todos.indexOf(todo);
    this.todos.splice(todoIndex, 1);
    this.currents.todos.changed().fire(this.todos);
  }

  editTodo({todo, text}){
    console.log(`store editTodo called`, todo, text);
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