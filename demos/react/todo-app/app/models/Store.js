import {Currents} from "currents";

export default class Store{
  constructor(){
    this.setInitialState();
    this.listen();
  }

  setInitialState(){
    const currents = this.currents = new Currents();
    const footerModelCurrents = this.currents.footerModel;
    const mainSectionModelCurrents = this.currents.mainSectionModel;
    this.todos = [];
    this.mainSectionModel = {
      toggled: false,
      mainSectionModelCurrents
    };
    this.footerModel = {
      filters:[
        {label: 'All', action:()=>{ currents.todos.filterAll().fire(); }},
        {label: 'Active', action:()=>{ currents.todos.filterActive().fire(); }},
        {label: 'Completed', action:()=>{ currents.todos.filterCompleted().fire(); }},
      ],
      showClearCompletedButton: false,
      selectedFilterLabel: 'All',
      itemsLeftLabel: 'items left',
      itemsLeftCount: 0,
      footerModelCurrents,
      displayFooter: false,
    };
  }

  listen(){
    this.currents.todos.addTodo().on(this.addTodo.bind(this));
    this.currents.todos.clearCompleted().on(this.clearCompleted.bind(this));
    this.currents.todos.completeAll().on(this.completeAll.bind(this));
    this.currents.todos.completeTodo().on(this.completeTodo.bind(this));
    this.currents.todos.deleteTodo().on(this.deleteTodo.bind(this));
    this.currents.todos.editTodo().on(this.editTodo.bind(this));
    this.currents.todos.filterCompleted().on(this.filterCompleted.bind(this));
    this.currents.todos.filterAll().on(this.filterAll.bind(this));
    this.currents.todos.filterActive().on(this.filterActive.bind(this));
    this.currents.todos.toggle().on(this.toggle.bind(this));
    this.currents.todos.changed().on(this.todosChanged.bind(this));
  }

  toggle(){
    this.mainSectionModel.toggled = !this.mainSectionModel.toggled;
    if(this.mainSectionModel.toggled){
      this.completeAll()
    }else{
      this.uncompleteAll();
    }
    this.currents.mainSectionModel.changed().fire(this.mainSectionModel);
  }

  todosChanged(todos){
    console.log(`store todosChanged`, todos);
    this.footerModel.showClearCompletedButton = todos.filter(todo => todo.completed).length > 0;
    this.footerModel.itemsLeftCount = todos.filter(todo => !todo.completed).length;
    this.footerModel.itemsLeftLabel = ` ${this.footerModel.itemsLeftCount == 1 ? 'item': 'items'} left`;
    this.footerModel.displayFooter = this.todos.length > 0;
    this.currents.footerModel.changed().fire(this.footerModel);
  }

  addTodo({id=generateRandomTodoId(), text, completed=false}){
    console.log(`store addTodo called: `, {id, text, completed});
    const todo = {id, text, completed};
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

  uncompleteAll(){
    console.log(`store uncompleteAll called`);
    this.todos.map(this.uncompleteTodo.bind(this));
  }

  completeTodo(todo){
    console.log(`store completeTodo called`, todo);
    todo.completed = true;
    this.currents.todos.changed().fire(this.todos);
  }

  uncompleteTodo(todo){
    console.log(`store uncompleteTodo called`, todo);
    todo.completed = false;
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

  filterCompleted(){
    console.log(`store filterCompleted called`);
    let filteredTodos = this.todos.filter(t=>t.completed);
    this.footerModel.selectedFilterLabel = 'Completed';
    this.currents.todos.changed().fire(filteredTodos);
  }

  filterAll(){
    console.log(`store filterAll called`);
    this.footerModel.selectedFilterLabel = 'All';
    this.currents.todos.changed().fire(this.todos);
  }

  filterActive(){
    console.log(`store filterActive called`);
    let filteredTodos = this.todos.filter(t=>!t.completed);
    this.footerModel.selectedFilterLabel = 'Active';
    this.currents.todos.changed().fire(filteredTodos);
  }
}

function generateRandomTodoId(){
  return `todo${Date.now()}_${generateRandomInt()}`;
}
function generateRandomInt(max=1000000000) {
  return Math.floor(Math.random() * Math.floor(max));
}