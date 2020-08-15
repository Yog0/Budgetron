// module pattern
//Budget Controller
let budgetController = (function() {
    let Expense = function(id, description, value) {
        this.id  = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {

        return this.percentage;

    }
    
    let Income = function(id, description, value) {
        this.id  = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        let sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }
    
    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val) {
            let newItem, ID;
            // create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            }
            else {
                ID = 0;
            }

            // create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push into data structure and return
            data.allItems[type].push(newItem);
            return newItem;
            
        },

        deleteItem: function(type, id) {

            var ids, index;

           ids = data.allItems[type].map(function(current) {
                return current.id;
            }),

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function() {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate budget: income - exp
            data.budget = data.totals.inc - data.totals.exp;

            // calculate percentages

            data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);

        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(c) {
                c.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            // use map here because it returns and stores something, while forEach doesn't.
            var allPerc = data.allItems.exp.map(function(c) {
                return c.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }
    }
})();


//UI Controller
let UIController = (function() {

    let DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputVal: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {

        // + or - before number, 2 decimal points, comma separating thousands. 2310.4567 -> + 2,310.26

        num = Math.abs(num).toFixed(2);
        var type;
        let numSplit = num.split('.');
        let int = numSplit[0];
        let dec = numSplit[1];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length -  3, int.length);
        }

        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {

        for (i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
    };

    return {
        getinput: function() {

            return {
                type: document.querySelector(DOMStrings.inputType).value, // we get a value for "inc" or "exp"
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputVal).value),
            };
            
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            if (type ==='inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }
           else if (type === 'exp') {
            element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="expe-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
           }
            
            // Replace placeholder test with actual data
            newHtml = html.replace('%id%', formatNumber(obj.id, type));
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
           document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(selectorID) {
            // delete child of element
            var el =  document.getElementById(selectorID);
           el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputVal);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc);
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp);
            

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);   // returns a node list

            nodeListForEach(fields, function(current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index]; + '%';
                }
                else {
                    current.textContent = '---';
                }

            });


        },

        displayMonth: function() {
            
            var now, year;
            now = new Date();
            months = ['January', ' February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {

            var fields;

            fields = document.querySelectorAll(
                DOMStrings.inputType + ', ' +
                DOMStrings.inputDescription + ', ' +
                DOMStrings.inputVal);

                nodeListForEach(fields, function(current) {
                    current.classList.toggle('red-focus');
                });

                document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

        },
        

        getDomStrings: function() {
            return DOMStrings; // exposes DOMStrings to public
        }
    }
})();


//Global App Controller
let controller = (function(budgetCtrl, UICtrl) {

    let setupEventListeners = function() {
        let DOM = UICtrl.getDomStrings(); // brings DOM strings in here. Now we only have to change them in one place.

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem());

        document.addEventListener('keypress', function(event) {
        if (event.keyCode === 13 || event.which === 13) {
            ctrlAddItem();          
        };
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function() {
        // 1. Calculate budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        let budget = budgetCtrl.getBudget();
        // 3. Display budget in UI

        UICtrl.displayBudget(budget); 
    }

    var updatePercentages = function() {

        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
        console.log(percentages);
        // 3. Update UI.

        UICtrl.displayPercentages(percentages);
    };

    let ctrlAddItem = function () {
        let input, newItem;
        
        // 1. Get input data from field
        input = UICtrl.getinput();

        if (input.description != "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. Add item to UI
            UICtrl.addListItem(newItem, input.type);

            // 4 Clear the fields

            UICtrl.clearFields();

            // 5. Calculate and update budget

           updateBudget();

           // 6. Calculate and update percentages

           updatePercentages();
        }
    };

    let ctrlDeleteItem = function(event) {

        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete item from data structure

            budgetCtrl.deleteItem(type, ID);

            // 2. delete item from UI

            UICtrl.deleteListItem(itemID);

            // 3. update and show new budget

            updateBudget();

            // 4. Calculate and update percentages

           updatePercentages();

        }

    };

    return {
        init: function() {
            console.log("Application online");
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners();
            UICtrl.displayMonth();
        }
    };

})(budgetController, UIController);

controller.init();