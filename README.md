gritted
=======

  a grid that shows her teeth...


```html
  <div id="grit">
    <a class="grid-item orange">Mr Orange</a>
    <a class="grid-item pink">Mr Pink</a>
    <a class="grid-item black">Mr Black</a>
  </div>

```

```javascript
  $("#grit").gritted({
    holes: "A2, B1"
  });
```

## Make Holes

Holes may be given at the creation of the grid, as a combination of chess-like coordinates and index (1-based numbers).

```javascript
  /**
   * In this example, there will allways be a hole in the 7th cell and in the 2 columns, 2nd lines
   */
  $("#my-grid").gritted({
    holes: "7, B2"
  });
```

Later, holes can still be added or widthdrawn from the grid.

```javascript
  var $grid = $("#my-grid").gritted();
  
  /**
   * In this example, there will allways be a hole in the 7th cell and in the 2 columns, 2nd lines
   */
  $grid.on("click", ".cell", function(evt) {
    $(this).data("grid-position").toggleHoles();
  });
  
```


## Filters

Filter methods are the most interesting thing on the menu after the holes.
To make elements appear/disappear according to your set of criterias, just apply the filter method on the grid with a class name (the class of elements to retain).

```javascript
  var grit = $("#my-grid").data("gritted");
  
  grit.filter(
    "orange", // keep only the elements that have the 'orange' class
    { 
      filterAnimation: "implode", // available options are 
                                  // slideLeft, slideRight, slideUp, slideDown, explode, implode, disappear, random
      fillFiltered: false // fill the holes ? (default : true)
    }
  );
```


## Minimum number of colums

Define the minimum number of columns to display holes. 1 by default.

```javascript
  /**
   * In this example, the holes will disappear when your grid has 2 columns or less.
   */
  $("#my-grid").gritted({
    holes: "7, B2",
    minLayout: 2 // minimal number of columns to show holes
  });
```
