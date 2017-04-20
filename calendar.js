(function(window){

  function EventListener(){
    this.listeners = [];
    this.post = function(type, dataObject){
      for(var i = 0; i < this.listeners.length; i++){
        if(this.listeners[i].type===type){
          this.listeners[i].callback.call(this, (!dataObject) ? null : dataObject);
        }
      }
    };
    this.on = function(type, callback){
      if(typeof callback === 'function')
      {
        if(typeof type === 'string')
        {
          this.listeners.push({
            type:type,
            callback:callback
          });
        }
        else if(!type)
        {
          throw new Error('Please reference an event type.')
          return false;
        }
        else
        {
          throw new Error('Event type should be a string.')
          return false;
        }
      }
      else if(!callback)
      {
        throw new Error('Please reference an event callback.')
        return false;
      }
      else
      {
        throw new Error('Event callback is not function.')
        return false;
      }
    }
    this.removeEvent = function(type){
      for (var i = 0; i < this.listeners.length; i++) {
        if(this.listeners[i].type===type){
          this.listeners.splice(i,1);
        }
      }
    }
  }
  /*
  *
  *
  *
  */
  function Calendar(params){
    //
    EventListener.call(this);
    //
    var params = params;
    //
    this.today = params.dateString ? new Date(params.dateString) : new Date();
    this.base = new Date(this.today.getFullYear(), this.today.getMonth(),this.today.getDate(),0,0,0,0);
    this.parent = document.createElement('div');
    //
    this.onUpdate = params.onUpdate;
    this.onSelected = params.onSelected;
    //
  }
  /*
  *
  *
  *
  */
  Calendar.prototype.getDateArray = function(date){
    //
    var arr = [];
    var date = date;
    //
    for ( var i = 0; i < 42; i++ ) {
      //
      var params = {
        day: this.getDayString(date.getDay()),
        date: date.getDate(),
        month: this.getMonthString(date.getMonth()),
        year: date.getFullYear(),
        string: date.toString()
      };
      //
      params.outOfRange = ( date.valueOf() < this.base.valueOf() ) ? true : false;
      //
      arr.push(params);
      //
      if ( params.outOfRange && this.today.toString() === date.toString() ){
        this.today.setDate(this.today.getDate()+1);
      }
      //
      date.setDate(date.getDate()+1);
    }
    //
    delete date;
    //
    return arr;
  }
  /*
  *
  *
  *
  */
  Calendar.prototype.create = function(){
    //
    this.parent.classList = 'calendar';
    //
    this.update();
    //
    return this.parent;
  }
  /*
  *
  *
  *
  */
  Calendar.prototype.update = function(){
    //
    var date = new Date(this.today.getFullYear(), this.today.getMonth(),1,0,0,0,0);
    var extras = (date.getDay() + 7) % 7;
    date.setDate(date.getDate() - extras);
    //
    var dateArray = this.getDateArray(date);
    //
    this.parent.innerHTML = '';
    this.parent.appendChild(this.getHeader());
    for ( var i = 0; i < dateArray.length; i++ ) {
      this.parent.appendChild(this.getDayButton(dateArray[i]));
    }
    //
    this.onUpdate(this.today);
  }
  /*
  *
  *
  *
  */
  Calendar.prototype.changeDay = function(dateString){
    //
    this.today = new Date(dateString);
    //
    this.onSelected(this.today);
    //
    this.update();
    //
  }
  /*
  *
  *
  *
  */
  Calendar.prototype.getNextMonth = function(direction){
    //
    var month = this.today.getMonth() + direction;
    var year = this.today.getFullYear();
    //
    if (month > 11) year++;
    if (month < 0) year--;
    //
    month = month > 11 ? 0 : month;
    month = month < 0 ? 11 : month;
    //
    return {
      month: month,
      year: year
    }
  }
  /*
  *
  *
  *
  */
  Calendar.prototype.changeMonth = function(direction){
    //
    var date = this.getNextMonth(direction);
    //
    this.today.setMonth(date.month);
    this.today.setFullYear(date.year);
    //
    this.update();
    //
    this.post('changeMonth', {
      month: this.getMonthString(this.today.getMonth()),
      year: date.year
    });
  }
  /*
  *
  *
  *
  */
  Calendar.prototype.getDayButton = function(params){
    if ( params === undefined ) return;
    //
    var self = this;
    var button = document.createElement('button');
    //
    button.setAttribute('data-date', params.string);
    //
    if ( params.date === this.today.getDate() ) {
      button.className = 'today';
    }
    //
    if ( params.month !== this.getMonthString(this.today.getMonth())) {
      button.className = params.class ? params.class + ' different-month' : 'different-month';
    }
    //
    if (params.outOfRange) {
      button.setAttribute('disabled','disabled');
    }
    //
    button.addEventListener('click', function(e){
      self.changeDay(this.getAttribute('data-date'));
    });
    //
    button.innerText = params.date;
    //
    return button;
  }
  /*
  *
  *
  *
  */
  Calendar.prototype.getMonthButton = function(params){
    //
    var self = this;
    //
    var button = document.createElement('button');
    //
    button.innerText = params.text;
    //
    if ( params.direction === -1 ) {
      //
      var nextMonth = this.getNextMonth(params.direction);
      //
      var date = new Date();
      date.setMonth(nextMonth.month);
      date.setFullYear(nextMonth.year);
      //
      if (date.valueOf() < this.base.valueOf()) {
        //
        button.setAttribute('disabled', 'disabled');
        //
        delete date;
      }
    }
    //
    button.addEventListener('click', function(e){
      self.changeMonth(params.direction);
    });
    //
    return button;
  }
  /*
  *
  *
  *
  */
  Calendar.prototype.getHeader = function(){
    //
    var monthSelect = document.createElement('div');
    monthSelect.classList = 'month-select';
    //
    monthSelect.appendChild(this.getMonthTitle());
    //
    monthSelect.appendChild(this.getMonthButton({
      text: 'prev',
      direction: -1
    }));
    //
    this.getDayTitle(monthSelect);
    //
    monthSelect.appendChild(this.getMonthButton({
      text: 'next',
      direction: 1
    }));
    //
    return monthSelect;
  };
  /*
  *
  *
  *
  */
  Calendar.prototype.getMonthTitle = function(){
    var title = document.createElement('h3');
    title.innerText = this.getMonthString(this.today.getMonth()) + ' ' + this.today.getFullYear();
    //
    this.on('changeMonth', function(params){
      title.innerText = params.month + ' ' + params.year;
    });
    //
    return title;
  }
  /*
  *
  *
  *
  */
  Calendar.prototype.getDayTitle = function(monthSelect){
    for (var i = 0; i < 7; i++ ) {
      var dayTitle = document.createElement('span');
      dayTitle.innerText = (this.getDayString(i)).substring(0, 3);
      monthSelect.appendChild(dayTitle);
    }
  }
  /*
  *
  *
  *
  */
  Calendar.prototype.getDayString = function(int){
    if ( int < 0 || int > 6 ) return false;
    return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][int];
  }
  /*
  *
  *
  *
  */
  Calendar.prototype.getMonthString = function(int){
    if ( int < 0 ) {
      int = 11;
    } else if ( int > 11 ) {
      int = 0;
    }
    return ['January','February','March','April','May','June','July','August','September','October','November','December'][int];
  }
  /*
  *
  *
  *
  */
  Calendar.prototype.hide = function(){
    this.parent.style.display = 'none';
  }
  /*
  *
  *
  *
  */
  Calendar.prototype.show = function(){
    this.parent.style.display = 'block';
  }
  /*
  *
  *
  *
  */
  window.Calendar = Calendar;
  //
})(window);