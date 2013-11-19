// app initialization
App = Em.Application.create({
  LOG_TRANSITIONS: true
});

// Adapter initialization
App.ApplicationAdapter = DS.LSAdapter;

// the model for a user
App.Task = DS.Model.extend({
  title : DS.attr(),
  desc : DS.attr(),
  done : DS.attr('boolean'),
  creationDate : DS.attr()
});

// router initialization
App.Router.map(function(){
  this.resource('tasks', function(){
    this.resource('task', { path:'/:task_id' }, function(){
      this.route('edit');
    });
    this.route('create');
  });
});

// index route
App.IndexRoute = Em.Route.extend({
  redirect: function(){
    this.transitionTo('tasks');
  }
});

// tasks route
App.TasksRoute = Em.Route.extend({
  model: function(){
    return this.store.find('task');
  },
  actions:{
    check:function(task){
      task.set('done', true);
      task.save();
    },
    uncheck:function(task){
      task.set('done', false);
      task.save();
    }
  }
});

// single task route - dynamic segment
App.TaskRoute = Em.Route.extend({
  model: function(params){
    return this.store.find('task', params.task_id);
  }
});

// singe task edit form route
App.TaskEditRoute = Em.Route.extend({
  model: function(){
    return this.modelFor('task');
  }
});

// task creation form route
App.TasksCreateRoute = Em.Route.extend({
  model: function(){
    // the model for this route is a new empty Ember.Object
    return Em.Object.create({});
  },

  // in this case (the create route) we can re-use the user/edit template
  // associated with the usersCreateController
  renderTemplate: function(){
    this.render('task.edit', {
      controller: 'tasksCreate'
    });
  }
});

// single task controller
App.TaskController = Em.ObjectController.extend({
  deleteMode: false,

  actions: {
    delete: function(){
      // the delete method only toggles deleteMode value
      this.toggleProperty('deleteMode');
    },
    cancelDelete: function(){
      // set deleteMode back to false
      this.set('deleteMode', false);
    },
    confirmDelete: function(){
      // this will tell Ember-Data to delete the current user
      this.get('model').deleteRecord();
      this.get('model').save();
      // and then go to the users route
      this.transitionToRoute('tasks');
      // set deleteMode back to false
      this.set('deleteMode', false);
    },
    edit: function(){
      this.transitionToRoute('task.edit');
    }
  }
});

// task creation form controller
App.TasksCreateController = Em.ObjectController.extend({
  actions: {
    save: function () {
      // just before saving, we set the creationDate
      this.get('model').set('creationDate', new Date());

      // save and commit
      var newTask = this.store.createRecord('task', this.get('model'));
      newTask.save();

      // redirects to the user itself
      this.transitionToRoute('task', newTask);
    }
  }
});

// single task edit form controller
App.TaskEditController = Em.ObjectController.extend({
  actions: {
    save: function(){
      var task = this.get('model');
      task.save();
      this.transitionToRoute('task', task);
    }
  }
});