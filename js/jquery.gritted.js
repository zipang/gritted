/**
 * jQuery Gritted - Show your teeth inside the grid

 * @author Zipang
 * @date 2014-02-01
 */
(function(w, $) {

	var _ALPHABET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

	function Gritted($grid, options) {
		this.settings = $.extend({}, Gritted.DEFAULTS, $grid.data(), options);
		this.$grid = $grid;

		// remove the original elements
		var $elements = $grid.children().remove().css({position: "absolute", top: -500, left: -500});
		this.elements = $.map($elements, $);

		// fill the grid with the desired coutn of floating elements 
		var count = this.settings.cols * this.settings.rows; 
		$grid.html(
			new Array(count+1).join("<div class=\"" + this.settings.fillItemsClass + "\"></div>")
		);

		var $gridItems = $grid.children(); // new 
		this.gridItems = $.map($gridItems, $);

		$elements.appendTo($grid); // re-append now absolute elements

		this.defineHoles(this.settings.holes);

		// register listener for size change
		var grit = this;
		function redispatchIfNeeded() {
			if (grit.hasChanged()) grit.redispatch();
		}
		$(w).on("resize", debounce(redispatchIfNeeded, 400));
	}


	// Some predefined filters
	Gritted.filters = {
		dissolve: function($grid, $elt, i) {
			var w = $grid.width(), h = $grid.height();
			$elt.animate({
				top: random([-1.5*h, -0.5*h], [1.5*h, 2.5*h]),
				left: random([-1.5*w, -0.5*w], [1.5*w, 2.5*w])
			});
		}	
	} 

	Gritted.DEFAULTS = {
		cols: 10, rows: 10, // grids dimensions
		fillItemsClass: "floating", // default class name for filling (invisible floating) elements
		duration: 1000, 
		easing: "",
		filterOut: Gritted.filters.dissolve
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
				elements = self.elements, // clone 
				gridItems = self.gridItems,
				lastYPos = -666,
				i = 0, lenny = gridItems.length,
				j = 0, jenny = elements.length,
				col = 1, line = 0;	

			while (i < lenny && j < jenny) {

				var offset = gridItems[i].position(), 
					x = offset.left,
					y = offset.top;

				if (y !== lastYPos) {
					line++;
					lastYPos = y; col = 1;
				} else {
					col++;
				}

				var gridPosition = new GridPosition(i, col, line);

				if (!gridPosition.isHole(holes)) {
					elements[j].text(gridPosition.name).animate({
						left: x, 
						top: y
					}, duration);
					j++;
				}
				
				i++;
			};
		},
		/**
		 * @return the current numer of columns of this grid
		 */
		hasChanged: function() {
			var hasChanged = false, nb = 1, col = 1, top = this.gridItems[0].position().top;
			while (this.gridItems[col++].position().top === top) nb++;
			hasChanged = (nb !== this.numberOfColumns);
			this.numberOfColumns = nb;
			return hasChanged;
		},
		filter: function(flt) {
			this.filter = flt;
			this.redispatch();
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

	$.fn.gritted = function(options) {
		return $(this).each(function (i, elt) {
			$(elt).data("gritted", new Gritted($(elt), options));
		});
	}
	
})(window, jQuery || Zepto);