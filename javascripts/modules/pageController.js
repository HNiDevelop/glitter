(function($, global) {

	var PageController = function() {
		this.errors = {
			'de': {
				'formEmpty': 'Es müssen alle Felder ausgefüllt werden!',
				'codeIncorrect': 'Bitte den angegebenen Code eintippen!'
			},
			'en': {

			}
		};

		this.language = 'de';
		this.fields = ['yourName', 'hatersName', 'hatersStreet', 'hatersCity', 'hatersZip', 'hatersCountry', 'yourMsg', 'formularCode', 'formularAnonym', 'checkCode'];

		this.code = null;
		this.dataObj = null;
		this.isSubmitted = false;

		//constants
		this.CLASS_ERROR = 'mark-error';

		//elements
		this.$error = null;
		this.$code = null;
		this.$sectionFormular = null;
		this.$sectionCheckout = null;
		this.$form = null;
	};

	PageController.prototype.init = function() {
		this.initElements();
		this.initEvents();
	};

	PageController.prototype.initElements = function() {
		//get error
		this.$error = $('#formular .error .error-message');

		//set code
		this.code = this.getCode();
		this.$code = $('#code');
		this.$code.text(this.code);

		this.$form = $('#formular form');
		this.$form.find('[name="checkCode"]').val(this.code);

		//get formular
		this.$sectionFormular = $('#formular');
		//get checkout
		this.$sectionCheckout = $('#checkout');
	};

	PageController.prototype.initEvents = function() {
		var _this = this;

		this.$form.on('submit', function(event) {
			//event.preventDefault();
		});

		$('.field.type-check input').on('click', function(event) {
			if($(this).parent().hasClass('on')) {
				$(this).parent().removeClass('on');
			} else {
				$(this).parent().addClass('on');
			}
		});

		$('#buy').on('click', function(event) {
			event.preventDefault();
			if(!_this.isSubmitted) {
				_this.handleFormular();	
			}			
		});

		$('.faq-item a').on('click', function(event) {
			event.preventDefault();
			$(this).parent().find('.answer').toggle();
		});

		$('.navigation a').on('click', function(event) {
			event.preventDefault();
			$('html, body').animate({'scrollTop': $($(this).attr('href')).position().top });
		});
	};

	PageController.prototype.handleFormular = function() {
		var fields = this.fields,
			isEmpty = false;

		//reset formular data
		this.dataObj = {};

		//remove error classes
		$('.'+this.CLASS_ERROR).removeClass(this.CLASS_ERROR);

		//get anonymous
		this.dataObj['formularAnonym'] = $('[name="formularAnonym"]').val();

		//check all input fields
		for(var i=0; i < fields.length; i++) {
			var key = fields[i],
				$field = $('[name="'+key+'"]'),
				val = $field.val();

			this.dataObj[key] = val;

			//validate if field is filled
			if(val === '') {
				$field.parent().addClass(this.CLASS_ERROR);
				isEmpty = true;
			}
		}

		if(isEmpty) {
			this.showError(this.errors[this.language].formEmpty);
			return false;
		}

		//validate formular before submit
		this.validateFormular();
	};

	PageController.prototype.validateFormular = function() {
		var _this = this;

		//check if code is correct
		if(this.code !== parseInt(this.dataObj.formularCode)) {
			$('[name="formularCode"]').parent().addClass(this.CLASS_ERROR);
			this.showError(this.errors[this.language].codeIncorrect);
			return false;
		}

		//send email
		//this.$form.submit();
		$.post( "../../../sendData.php", _this.dataObj).done(function(data) {
			//alert( "Data send: " + data );
		});

		//hide formular
		this.$sectionFormular.fadeOut();

		//show checkout
		this.$sectionCheckout.fadeIn();

		//set flag
		this.isSubmitted = true;
	};

	PageController.prototype.showError = function(errorMsg) {
		this.$error.html(errorMsg).parent().show();
	};

	PageController.prototype.getCode = function() {
		return Math.floor(Math.random()*9000) + 1000;
	};


	global.glitter = global.glitter || {};
	global.glitter.autoInit = global.glitter.autoInit || {};
	global.glitter.autoInit.PageController = PageController;

})(jQuery, window);