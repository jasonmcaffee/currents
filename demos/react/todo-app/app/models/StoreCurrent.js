import {Currents} from "currents";

export default class StoreCurrent extends Currents{
  constructor(){
    super();
    this.listen();
    this.store = {
      todos: [],
    };
  }

  listen(){
    this.todos.addTodo().on(this.addTodo.bind(this));
    this.todos.clearCompleted().on(this.clearCompleted.bind(this));
    this.todos.completeAll().on(this.completeAll.bind(this));
  }

  addTodo({text, completed=false}){
    const todo = {text};
    this.store.todos.push(todo);
    this.todos.changed().fire(this.store.todos);
  }

  clearCompleted(){
    this.store.todos = this.store.todos.filter(todo => !todo.completed);
    this.todos.changed().fire(this.store.todos);
  }

  completeAll(){
    this.store.todos.map(this.completeTodo);
  }

  completeTodo(todo){
    todo.completed = true;
    this.todos.changed().fire(this.store.todos);
  }
}