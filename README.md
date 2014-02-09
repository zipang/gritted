gritted
=======

a grid that shows her teeth...

```javascript
  $("#my-grid").gritted({
    holes: "A1, A5, B2, B4, C3, D2, D4, E1, E5"
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
  
  /**
   * In this example, holes are given visually in a grid of 7x7
   */
  $("#my-grid").gritted({
    holes: ". ... .\n"
         + ".. . ..\n"
         + "... ...\n"
         + ".. . ..\n"
         + ". ... .\n"
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
To make elements appear/disappear according to ypur set of criterias, just apply the filter method on the grid with a class name (the class of elements to retain).

```javascript
  $("#my-grid").data("gritted").filter({
    filterClass: "orange", // keep the elements that have the 'orange' class
    filterAnimation: "implode", // available options are 
                                // slideLeft, slideRight, slideUp, slideDown, explode, implode, disappear, random
    fillFiltered: true
  });
```

- 
