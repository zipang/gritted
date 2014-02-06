/**
 * jQuery Gritted - Show your teeth inside the grid

 * @author Zipang
 * @date 2014-02-01
 */
(function(w, $) {
"use strict";

	var _ALPHABET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

	function Gritted($grid, options) {
		var grit = this,
			settings = grit.settings = $.extend({}, Gritted.DEFAULTS, $grid.data(), options);

		grit.$grid = $grid;

		// remove the original elements
		var $elements = $grid.children().remove().css({position: "absolute", top: -500, left: -500});
		grit.elements = $.map($elements, $);

		// fill the grid with the desired number of floating elements
		var count = settings.cols * settings.rows;
		$grid.html(
			new Array(count+1).join("<div class=\"" + settings.cellItemsClass + "\"></div>")
		);

		grit.cells = $.map($grid.children(), function(cell, i) {
			var $cell = $(cell);
			$cell.gridPosition = new GridPosition(grit, $cell, i);
			return $cell;
		});
		grit.columnCount(); // get the real columns count

		$elements.appendTo($grid); // re-append now absolute elements

		// Set the holes and redispatch our elements around
		grit.defineHoles(settings.holes);

		// register listener for layout change
		function redispatchIfNeeded() {
			if (grit.hasLayoutChanged()) grit.redispatch();
		}
		$(w).on("resize orientationchange", debounce(redispatchIfNeeded, 400));
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
		applyOpacityOnFilters: true, // Automatically fade filtered elements
		replaceFilteredElements: true,
		showHolesForLayoutsOver: 1, // minimal number of columns to show holes
		duration: 1000
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
				noHoles = (self._numberOfColumns <= settings.showHolesForLayoutsOver),
				duration = settings.duration,
				filterClass = self.filterClass,
				filteredClass = settings.filteredClass,
				filterAnimation = settings.filterAnimation,
				replaceFilteredElements = settings.replaceFilteredElements,
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

				pos  = cells[i].gridPosition;
				advanceToNextPosition = true;

				// next element to redispatch on the grid or out
				$elt = elements[j];

				if (noHoles || !pos.isHole(holes)) { // place an element here

					if (filterClass && !$elt.hasClass(filterClass) && !$elt.hasClass(filteredClass)) {
						// this element must be filtered 
						destination = filterAnimation(self.$grid, elements[j], j);

						if (settings.applyOpacityOnFilters) destination.opacity = 0;
						$elt.addClass(filteredClass);
						if (replaceFilteredElements) advanceToNextPosition = false;

					} else {
						// the destination is the cell position, with full opacity
						destination = $.extend(pos.cssPosition(), { width: w, height: h, opacity: 1 });
					}

					$elt.animate(destination, duration);
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
			return grit._numberOfColumns = Math.floor(grit.$grid.width() / grit.cells[0].outerWidth(true));
		},

		/**
		 * @return TRUE if the layout (number of columns) has changed since last call
		 */
		hasLayoutChanged: function() {
			var nb = this._numberOfColumns;
			return (this.columnCount() !== nb);
		},

		/**
		 * Apply a filter
		 */
		filter: function(className, options) {
			var grit = this,
				filteredClass = grit.settings.filteredClass;

			if (className !== grit.filterClass) { // blank filter : display all
				if (filteredClass) $("." + filteredClass, grit.$grid).removeClass(filteredClass);
				grit.filterClass = className;

				if (options) { // override some options
					$.extend(grit.settings, options);
				}

				grit.redispatch();
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
	function GridPosition(grit, $cell, zero_index) {
		this.grit = grit;
		this.$cell = $cell;
		this.index = zero_index;
	}

	GridPosition.prototype = {
		toString: function() {
			var line = Math.floor(this.index / this.grit._numberOfColumns) + 1,
				col  = (this.index % this.grit._numberOfColumns) + 1;
			return (_ALPHABET[line] + col); // chess style coords
		},
		cssPosition: function() {
			var pos = this.$cell.position();
			return {top: pos.top, left: pos.left};
		},
		isHole: function() {
			var holesDef = this.grit.holes;
			return holesDef["" + this] || holesDef[this.index+1];
		},
		makeHole: function() {
			this.grit.holes["" + this] = true;
		},
		removeHole: function() {
			delete this.grit.holes["" + this];
		},
		toggleHole: function(mode) {
			var holesDef = this.grit.holes;
			if (mode === "index") {
				if (holesDef[this.index+1]) delete holesDef[this.index+1]; else holesDef[this.index+1] = true;
			} else {
				var name = this.getName();
				if (holesDef[name]) delete holesDef[name]; else holesDef[name] = true;
			}
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

})(window, jQuery || Zepto);
