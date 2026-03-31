(function (drupalSettings) {
	"use strict";
	var custom_var = {};
	var tc_vars_base = {
	    //<!-- Environnement -->
	    env_template : "", // Website / Order / ConfirmationPage
	    env_work : "",
	    env_device : navigator.userAgent,
	    //<!-- Users -->
	    user_category : "",
	    user_id : "", //
	    user_code: "",   // *********************************************************************************** Customer code
	    user_gender : "",
	    user_age : "",
	    user_postalcode : "",
	    user_address : "",
	    user_firstname : "",
	    user_lastname : "",
	    user_email : "",
	    user_newcustomer : "",
	    user_profil : "", // legal form   *********************************************************************************** need API  Entreprise // Particuliers
	    //<!-- Tree structure -->
	    //<!-- Search results -->
	    searchKeywords : sessionStorage.getItem('algolia-search-keyword') ? sessionStorage.getItem('algolia-search-keyword') : "",
	    searchKeywordsPosition : sessionStorage.getItem('algolia-search-keyword-position') ? sessionStorage.getItem('algolia-search-keyword-position') : "",
	    searchPageNumber : sessionStorage.getItem('algolia-search-page-number') ? sessionStorage.getItem('algolia-search-page-number') : "",
	    search_filters : [],
	    //<!-- Product information (product page + list page + basket + confirmation) -->
	    product_array : [ {
	        product_category : "",
	        product_id : "",
	        product_id_variation : "",
	        product_name : "",
	        product_name_variation : "",
	        product_unitprice_without_vat : "",
	        product_unitprice_with_vat : "",
	        product_amount : "",
	        product_discount: "",
	        product_url : "",
	        product_url_img : "",
	        product_level1_name : "",
	        product_level2_name : "",
	        product_level3_name : "",
	        product_level4_name : "",
	        product_level5_name : "",
	        product_level6_name : "",
	        product_qty : ""
	    } ],

	    isBasketPage : "",
	    basket_id : "",
	    order_id : "",
	    order_payment_methods : "",
	    order_status : "",
	    order_amount : "",
	    order_amount_free : "",
	    order_amount_vat : "",
	    order_discount_without_vat: "",
	    order_discount_with_vat: "",
	    order_promo_code: "",
	    order_product_number : "",
	    Getorder_amount : "",
	    Getorder_amount_free : "",
	    Getorder_amount_vat : "",
	    Page_indicator : "",
	};

	window.tc_vars = Object.assign(tc_vars_base, drupalSettings.commanders_act.tc_vars);

	sessionStorage.removeItem('algolia-search-keyword');
	sessionStorage.removeItem('algolia-search-keyword-position');
	sessionStorage.removeItem('algolia-search-page-number');

})(drupalSettings);

;
