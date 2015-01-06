/**
 * jQuery Gritted - Show your teeth inside the grid

 * @author Zipang
 * @date 2015-01-06
 */
(function(w, undefined) {
"use strict";

	var $ = w.jQuery || w.Zepto,
		_ALPHABET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

	function Gritted($grid, options) {

		var grit = this,
			settings = grit.settings = $.extend({}, Gritted.DEFAULTS, $grid.data(), options),
			// remove the original elements
			$elements = (grit.$grid = $grid).children()
				.remove()
					.css({
						position: "absolute", top: 0, left: -600
				}),
			// Parse the holes definition
			count = grit.defineHoles(settings.holes);

		// Remap elements as an Array of jQuery elements for faster access
		grit.elements = $.map($elements, $);

		// Fill the grid with the desired number of floating elements
		count = Math.max(settings.cols * settings.rows, $elements.length + count);
		$grid.html(
			new Array(count+1).join("<div class=\"" + settings.cellItemsClass + "\"></div>")
		);
		// Enhance these cells with their GridPosition
		grit.cells = $.map($grid.children(), function(cell, i) {
			var $cell = $(cell);
			$cell.data("grid-position", new GridPosition(grit, $cell, i));
			return $cell;
		});

		$elements.appendTo($grid); // re-append now absolute elements

		// Register listener for layout change
		function redispatchIfNeeded() {
			if (grit.hasLayoutChanged()) grit.redispatch();
		}
		$(w).on("resize orientationchange", debounce(redispatchIfNeeded, 400));

		redispatchIfNeeded(); // of course yes
	}

	// Some predefined filters
	Gritted.filters = {
		default: function() {
			return {};
		}
	}

	Gritted.DEFAULTS = {
		cols: 10, rows: 5, // grids dimensions
		cellItemsClass: "cell", // default class name for filling (invisible floating) elements
		//filteredClass: "", // We can apply a special class to the elements being filtered
		//filterAnimation: "",
		fadeFiltered: true, // Automatically fade filtered elements
		replaceFiltered: true,
		minLayout: 1, // minimal number of columns to show holes
		duration: 500 // time for the cell to go to her place
	};

	Gritted.prototype = {
		/**
		 * Redispatch filtered elements on the grid,
		 * taking care of holes
		 */
		redispatch: function () {

			var self = this,
				settings = self.settings,
				holes  = self.holes,
				noHoles = (self._cols <= settings.minLayout),
				duration = settings.duration,
				filterClass = self.filterClass,
				filteredClass = settings.filteredClass,
				filterAnimation = settings.filterAnimation,
				replaceFiltered = settings.replaceFiltered,
				cells = self.cells, i = 0, lenny = cells.length,
				elements  = self.elements, j = 0, jenny = elements.length,
				w = cells[0].width(), h = cells[0].height(),
				pos, destination, advanceToNextPosition,
				$elt; // each element to reposition

			// Check existence of filter method
			if (typeof filterAnimation !== "function") {
				filterAnimation = settings.filterAnimation = Gritted.filters[filterAnimation] || Gritted.filters.default;
			}

			while (i < lenny && j < jenny) {

				pos  = cells[i].data("grid-position");
				advanceToNextPosition = true;

				// next element to redispatch on the grid or out
				$elt = elements[j];

				if (noHoles || !pos.isHole(holes)) { // place an element here

					if ($elt.hasClass(filteredClass)) {
						if (replaceFiltered) advanceToNextPosition = false;

					} else {

						if (filterClass && !$elt.hasClass(filterClass)) {
							// this element must be filtered
							destination = filterAnimation(self.$grid, elements[j], j);

							if (settings.fadeFiltered) destination.opacity = 0;
							$elt.addClass(filteredClass);
							if (replaceFiltered) advanceToNextPosition = false;

						} else {
							// the destination is the cell position, with full opacity
							destination = $.extend(pos.cssPosition(), { width: w, height: h, opacity: 1 });
						}

						$elt.animate(destination, duration);
					}
					j++;
				}

				if (advanceToNextPosition) i++;
			};
		},

		/**
		 * @return the current number of columns of this grid
		 */
		columnCount: function() {
			var grit = this;
			return grit._cols = Math.floor(grit.$grid.width() / grit.cells[0].outerWidth(true));
		},

		/**
		 * @return TRUE if the layout (number of columns) has changed since last call
		 */
		hasLayoutChanged: function() {
			var nb = this._cols;
			return (this.columnCount() !== nb);
		},

		/**
		 * Apply a filter
		 */
		filter: function(className, options) {
			var grit = this,
				filteredClass = grit.settings.filteredClass;

			if (filteredClass) $("." + filteredClass, grit.$grid).removeClass(filteredClass);

			grit.filterClass = className;

			if (options) { // override some options
				$.extend(grit.settings, options);
			}

			grit.redispatch();
		},

		defineHoles: function(def) {
			var holes = this.holes = {},
				hole, count = 0;

			if (def) { // comma separated list of holes
				def = def.split(/[\s\,]+/g);
				count = def.length;

				while (hole  = def.pop()) holes[hole] = true;
			}

			return count;
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


	/**
	 * 1-based position + A1/B2 style base posiiton
	 */
	function GridPosition(grit, $cell, zero_index) {
		this.grit  = grit;
		this.$cell = $cell;
		this.index = zero_index;
	}

	GridPosition.prototype = {
		toString: function() {
			var i = this.index, columnCount = this.grit._cols,
				line = Math.floor(i / columnCount) + 1,
				col  = (i % columnCount) + 1;
			return (_ALPHABET[line] + col); // chess style coords
		},
		cssPosition: function() {
			var pos = this.$cell.position();
			return {top: pos.top, left: pos.left};
		},
		isHole: function() {
			var gp = this, holesDef = gp.grit.holes;
			return holesDef["" + gp] || holesDef[gp.index+1];
		},
		makeHole: function() {
			var grit = this.grit;
			grit.holes["" + this] = true;
			grit.redispatch();
		},
		removeHole: function() {
			delete this.grit.holes["" + this];
		},
		toggleHole: function(mode) {
			var grit = this.grit,
				holesDef = grit.holes,
				holePos = (mode === "index") ? grit.index + 1 : "" + this ;

			holesDef[holePos] = !holesDef[holePos];
			grit.redispatch();
		}
	}
	GridPosition.prototype.getName = GridPosition.prototype.toString;

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

})(window);
