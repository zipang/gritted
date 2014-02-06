gritted
=======

a grid that shows her teeth...

```javascript
  $("#my-grid").gritted({
    holes: "A1, A5, B2, B4, C3, D2, D4, E1, E5"
  });
```

## Make Holes

## Filters

Filter methods are the most interesting thing on the menu after the holes.
To make elements appear/disappear according to ypur set of criterias, just apply the filter method on the grid with a class name (the class of elements to retain).

```javascript
  $("#my-grid").data("gritted").filter({
    className: "orange", // keep the elements that have the 'orange' class
    filterAnimation: "implode"
  });
```

Here is the list of available effects when filtering elements
(pass param as `filterAnimation`)

- slideLeft
- slideRight
- slideUp
- slideDown
- explode
- implode
- disappear
- random
