function ready(cb) {
    /in/.test(document.readyState)
    ? setTimeout(ready.bind(null, cb), 90)
    : cb();
};

ready(function(){
    
    function Parking() {

    // URL of the Search API
    this.API_URL = 'http://datatank.stad.gent/4/mobiliteit/bezettingparkingsrealtime.json?callback=json_callback';
    // The results within the JSON-object
    this._previousParkingStates;
    this._parkingStates;
    // UI generated
    this._uiGenerated = false;

    // Initialize App
    this.init = function() {
      console.log('1. Initialize the app');

      this.loadData();
    }

    // Load the data from the API
    this.loadData = function() {
      console.log('2. Load the Data');

      // Hack --> Closure
      var that = this;

      var xhr = new XMLHttpRequest();
      xhr.open('get', this.API_URL, true);
      xhr.responseType = 'json';
      xhr.onload = function() {
          if(xhr.status == 200) {
              var data = (!xhr.responseType)?JSON.parse(xhr.response):xhr.response;
              data = data.sort(function (a, b) {
                if (a.name > b.name) {
                  return 1;
                }
                if (a.name < b.name) {
                  return -1;
                }
                // a must be equal to b
                return 0;
              });
              that._parkingStates = data;
              that.updateUI();

              window.setTimeout( function() { that.loadData(); }, 30000);
          } else {
              console.log(xhr.status);
          }
      }
      xhr.onerror = function() {
          console.log(Error('Network Error!'));
      }
      xhr.send();

    };

    // Update the User Interface (UI)
    this.updateUI = function() {
      console.log('3. Update UI');

      if(!this._uiGenerated) {
        this._previousParkingStates = this._parkingStates;
        this._uiGenerated = true;
        // Call the function generateTableUI
        this.generateTableUI();
      } else {
        // Call the function updateTableUI
        this.updateTableUI();
      }
      
    };

    // Generate the albums as a table with rows
    this.generateTableUI = function() {
      console.log('4. Generate UI with table-element');
      
      var tempStr = '';
      tempStr += '<ul class="demo-list-three mdl-list">';
      for(var i=0;i<this._parkingStates.length;i++) {
        var parking = this._parkingStates[i];
        var parkingPrevious = this._previousParkingStates[i];
        tempStr += '<li class="mdl-list__item mdl-list__item--three-line" data-id="' + parking.name.split(' ')[0] + '">';
        tempStr += '<span class="mdl-list__item-primary-content">';
        tempStr += '<i class="material-icons mdl-list__item-avatar parking__color-state ' + this.convertStateToColorStateClass(parking.parkingStatus.availableCapacity, parking.parkingStatus.totalCapacity) + '"></i>';
        tempStr += '<span>' + parking.description + '</span>'+'<br>';
        tempStr += '<span class="mdl-list__item-text-body">';
        tempStr += parking.name.split(' ')[0];
        tempStr += '</span>';
        tempStr += '</span>';
        tempStr += '<span class="mdl-list__item-secondary-content parking__state">';
        tempStr += '<span class="state__available">' + parking.parkingStatus.availableCapacity + '</span>';
        tempStr += '<span class="state__indicator ' + this.convertStateToIndication(parkingPrevious.parkingStatus.availableCapacity, parking.parkingStatus.availableCapacity) + '"></span>'+'<br>'; 
        tempStr += '</span>';
        tempStr += '</li>';
      };
      tempStr += '</ul>';
      document.querySelector('.parking-results').innerHTML = tempStr;
    };

    this.updateTableUI = function() {
      console.log('4. Update UI with table-element');
      
      for(var i=0;i<this._parkingStates.length;i++) {
        var parking = this._parkingStates[i];
        var parkingPrevious = this._previousParkingStates[i];
        var parkingElement = document.querySelector('[data-id="' + parking.name.split(' ')[0] + '"]');
        var indicatorStateElement = parkingElement.querySelector('.parking__state .state__indicator');
        indicatorStateElement.classList.remove('state__indicator--up');
        indicatorStateElement.classList.remove('state__indicator--down');
        indicatorStateElement.classList.remove('state__indicator--equal');
        var indicator = this.convertStateToIndication(parkingPrevious.parkingStatus.availableCapacity, parking.parkingStatus.availableCapacity);
        indicatorStateElement.classList.add(indicator);
        parkingElement.querySelector('.parking__state .state__available').innerHTML = parking.parkingStatus.availableCapacity;
        var colorStateElement = parkingElement.querySelector('.parking__color-state');
        colorStateElement.classList.remove('parking__color-state--green');
        colorStateElement.classList.remove('parking__color-state--orange');
        colorStateElement.classList.remove('parking__color-state--red');
        parkingElement.querySelector('.parking__color-state').classList.add(this.convertStateToColorStateClass(parking.parkingStatus.availableCapacity, parking.parkingStatus.totalCapacity));
      };


      this._previousParkingStates = this._parkingStates;

    };

    this.convertStateToColorStateClass = function(available, total) {
      var perc = Math.round((available / total) * 100);
      if(perc >= 60) {
        return 'parking__color-state--green';
      } else if(perc < 60 && perc >= 20) {
        return 'parking__color-state--orange';
      } else {
        return 'parking__color-state--red';
      }
    };

    this.convertStateToIndication = function(previousAvailable, available) {
      previousAvailable = parseInt(previousAvailable);
      available = parseInt(available);
      if(previousAvailable > available) {
        return 'state__indicator--down';
      } else if(previousAvailable < available) {
        return 'state__indicator--up';
      } else {
        return 'state__indicator--equal';
      }
    };

  };

  // Make an instance of the Parking
  var app = new Parking();
  // Initialize the app
  app.init();

});
