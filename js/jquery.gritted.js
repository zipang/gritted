/**
 * jQuery Gritted - Show your teeth inside the grid

 * @author Zipang
 * @date 2014-02-01
 */
(function(w, $) {
"use strict";

	var _ALPHABET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

	function Gritted($grid, options) {
		var grit = this;

		grit.settings = $.extend({}, Gritted.DEFAULTS, $grid.data(), options);
		grit.$grid = $grid;

		// remove the original elements
		var $elements = $grid.children().remove().css({position: "absolute", top: -500, left: -500});
		grit.elements = $.map($elements, $);

		// fill the grid with the desired number of floating elements 
		var count = grit.settings.cols * grit.settings.rows; 
		$grid.html(
			new Array(count+1).join("<div class=\"" + grit.settings.fillItemsClass + "\"></div>")
		);

		var $gridItems = $grid.children();
		grit.gridItems = $.map($gridItems, $);
		grit.columnCount(); // get the real columns count

		$elements.appendTo($grid); // re-append now absolute elements

		// Set the holes and redispatch our elements around
		grit.defineHoles(grit.settings.holes);

		// register listener for layout change
		function redispatchIfNeeded() {
			if (grit.hasChanged()) grit.redispatch();
		}
		$(w).on("resize", debounce(redispatchIfNeeded, 400));
	}


	// Some predefined filters
	Gritted.filters = {
		default: function($grid, $elt, i) {
			return {};
		}
	} 

	Gritted.DEFAULTS = {
		cols: 10, rows: 10, // grids dimensions
		fillItemsClass: "floating", // default class name for filling (invisible floating) elements
		filteredItemsClass: "filtered",
		filterOut: "slideLeft",
		filterFillHoles: true,
		duration: 1000, 
		easing: ""
	};

	Gritted.prototype = {
		/**
		 * Redispatch filtered elements on the grid, 
		 * taking care of holes
		 */
		redispatch: function () {
			var self = this,
				holes  = self.holes,
				duration = self.settings.duration,
				filterClass = self.filterClass,
				filterOut = self.settings.filterOut,
				filterFillHoles = self.settings.filterFillHoles,
				elements = self.elements,
				gridItems = self.gridItems,
				lastYPos = -666,
				i = 0, lenny = gridItems.length,
				j = 0, jenny = elements.length,
				col = 1, line = 0,
				w = gridItems[0].width(), h = gridItems[0].height(),
				pos, x, y, gridPosition, destination, advanceToNextPosition,
				$elt; // each element to reposition

			// Check existence of filter method
			if (typeof filterOut === "string") {
				filterOut = self.settings.filterOut = Gritted.filters[filterOut] || Gritted.filters.default;
			}

			while (i < lenny && j < jenny) {

				$elt = elements[j];
				pos = gridItems[i].position();
				x = pos.left; y = pos.top;
				advanceToNextPosition = true;

				if (y !== lastYPos) {
					line++;
					lastYPos = y; col = 1;
				} else {
					col = (i % self._numberOfColumns) + 1;
				}

				gridPosition = new GridPosition(i, col, line);

				if (!gridPosition.isHole(holes)) { // place an element

					destination = { left: x, top: y, width: w, height: h };

					if (filterClass) { // try to see if we must filter out that element
						if (!$elt.hasClass(filterClass) && !$elt.hasClass("filtered")) {
							destination = filterOut(self.$grid, elements[j], j);
							$elt.addClass("filtered");
							if (filterFillHoles) advanceToNextPosition = false;
						}
					}
					
					$elt.text(gridPosition.name).animate(destination, duration);
					j++;
				}
				
				if (advanceToNextPosition) i++;
			};
		},
		/**
		 * @return the current numer of columns of this grid
		 */
		columnCount: function() {
			var nb = 1, col = 1, top = this.gridItems[0].position().top;
			while (this.gridItems[col++].position().top === top) nb++;
			return this._numberOfColumns = nb;
		},
		/**
		 * @return TRUE if the layout (number of columns) has changed since last call 
		 */
		hasChanged: function() {
			var nb = this._numberOfColumns;
			return (this.columnCount() !== nb);
		},
		/**
		 * Apply a filter 
		 */
		filter: function(className, options) {
			var gritted = this;

			if (className !== gritted.filterClass) { // blank filter : display all
				$(".filtered", gritted.$grid).removeClass("filtered");
				gritted.filterClass = className;

				if (options) { // override some options 
					$.extend(gritted.settings, options);
				}

				gritted.redispatch();
			}
		},
		defineHoles: function(def) {
			this.holes = parseHolesDef(def);
			this.redispatch();
		}
	}

	function debounce(fn, delay) {
		delay = delay || 250;
		return function() {
			var ctx = this, args = arguments;
			clearTimeout(fn.hnd);
			fn.hnd = setTimeout(function() {
				fn.apply(ctx, args);
			}, delay);
		};
	};


	Array.prototype.random = function() { return this[Math.floor(Math.random()*this.length)]; }

	function random(plages) {
		var plage = plages.random(),
			min = plage[0], max = plage[1];

		return min + Math.floor(Math.random()*(max - min));
	}

	/**
	 * From 
	 */
	function parseHolesDef(def) {
		var holes = {};

		if (def && def.indexOf(",") !== -1) { // comma separated list of holes
			
			$.each(def.split(","), function(i, hole) {
				holes[hole.trim()] = true;
			});

		} else { // something else like : " XXXX XX \nXXX  XXX"

		}
		return holes;
	}

	/**
	 * 1-based position + A1/B2 style base posiiton
	 */
	function GridPosition(index, col, line) {
		this.index = index+1;
		this.name = _ALPHABET[line] + col; // chess style coords
	}

	GridPosition.prototype = {
		isHole: function(holes) {
			if (!holes) return false;
			return holes[this.index] || holes[this.name];
		}
	}

	/**
	 * The jQuery plugin invocation method
	 * Applied to a container element (the grid) it will fill it with (usually invisible elements)
	 * and make the original content move fluidly around the holes
	 */
	$.fn.gritted = function(options) {
		if (options === "namespace") return Gritted; // export our constructor

		return $(this).each(function (i, elt) {
			$(elt).data("gritted", new Gritted($(elt), options));
		});
	}
	
})(window, jQuery || Zepto);