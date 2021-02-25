//------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------

//+---------------------------------------------------------------------------------+
//|                                                                                	|
//|            pluginViaCEP - by Dorovan(Luis Gustavo Hunzecher de Castro)			|
//|                                                                                	|
//+---------------------------------------------------------------------------------+

//------Manter a estrutura da array viaCEP da maneira que está, caso haja modificações será necessario rever os metodos e processos deste plugin

//------Para alterar o nome do cache, basta alterar o valor da estrutura viaCEP.config.cacheName

//------Nomes de Campos: cep, endereco, bairro, cidade, complemento, uf, unidade, ibge e gia

//------Como utilizar o plugin : incluindo a classe .viacep-[campo] (Consulte os nomes dos campos conforme acima)

//------Cache local: a integração possui funções para armazenamento, carregamento e exclusão do cache (consulte a documentação das funções)

//------Funções: defineValorCampo(campo, valor), carregaCache(), gravaCache(dados), limpaCache()

//------defineValorCampo(campo, valor)
//-campo = o nome do campo de acordo com a estrutura do plugin (#viacep-cep e etc)
//-valor = o valor que o campo receberá

//------carregaCache()
//-retorna a estrutura de dados armazenados em cache local consultadas pela API viaCEP

//------gravaCache(dados)
//-grava o valor de dados em cache local consultadas pela API viaCEP

//------limpaCache()
//-limpa o cache local da consulta pela API viaCEP

//------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------

var viaCEP = {
	inputs : {
		cep : ["#viacep-cep", ".viacep-cep", "input[name='viacep-cep']"],
		logradouro : ["#viacep-endereco", ".viacep-endereco", "input[name='viacep-endereco']", "select[name='viacep-endereco']"],
		bairro : ["#viacep-bairro", ".viacep-bairro", "input[name='viacep-bairro']", "select[name='viacep-bairro']"],
		localidade : ["#viacep-cidade", ".viacep-cidade", "input[name='viacep-cidade']", "select[name='viacep-cidade']"],
		complemento : ["#viacep-complemento", ".viacep-complemento", "input[name='viacep-complemento']"],
		uf : ["#viacep-uf", ".viacep-uf", "input[name='viacep-uf']", "select[name='viacep-uf']"],
		unidade : ["#viacep-unidade", ".viacep-unidade", "input[name='viacep-unidade']"],
		ibge : ["#viacep-ibge", ".viacep-ibge", "input[name='viacep-ibge']"],
		gia : ["#viacep-gia", ".viacep-gia", "input[name='viacep-gia']"],
		siafi : ["#viacep-siafi", ".viacep-siafi", "input[name='viacep-siafi']"],
		ddd : ["#viacep-ddd", ".viacep-ddd", "input[name='viacep-ddd']"]
	},
	config : {
		cacheName : "viaCEP-Cache"
	},
	defineValorCampo : (campo, valor) => {
		for(var ponteiroCampo = 0; ponteiroCampo < viaCEP.inputs[campo].length; ponteiroCampo++){
			if($(viaCEP.inputs[campo][ponteiroCampo]).val() != undefined){
				if($(viaCEP.inputs[campo][ponteiroCampo]).hasClass("select2me")){
					$(viaCEP.inputs[campo][ponteiroCampo]).val($(viaCEP.inputs[campo][ponteiroCampo]+" option[data-viacep-uf='"+valor+"']").val()).trigger('change');
				} else {
					$(viaCEP.inputs[campo][ponteiroCampo]).val(valor);
				}
				return false;
			}
		}
	},
	carregaCache : () => {
		return JSON.parse(localStorage.getItem(viaCEP.config.cacheName));
	},
	gravaCache : (dados) => {
		localStorage.setItem(viaCEP.config.cacheName, JSON.stringify(dados));
	},
	limpaCache : () => {
		localStorage.removeItem(viaCEP.config.cacheName);
	}
}

jQuery(document).ready(($)=> {

	$(document).on('change', JSON.stringify(viaCEP.inputs.cep).replace(/(",")/g,", ").replace(/(\[")|("\])/g, ""), (data)=>{

		// Define as Variaveis

			var CEP = null;
			
			for(var ponteiroCampo = 0; ponteiroCampo < viaCEP.inputs.cep.length; ponteiroCampo++){
				if($(viaCEP.inputs.cep[ponteiroCampo]).val() != undefined){
					CEP = $(viaCEP.inputs.cep[ponteiroCampo]);
					break;
				}
			}

		// Valida a Variavel

			var validacao = []
				validacao[0] = (CEP.val()).trim() != "" && (CEP.val()).trim() != " " && (CEP.val()).length > 0 && (CEP.val()).length > 0 && (CEP.val()).length <= 10;

			var validaCampos = validacao[0];

		// Verifica se a validação retornou verdadeiro

			if(validaCampos){
				$.ajax({
					type: "GET",
					dataType: "html",
					url: 'https://viacep.com.br/ws/'+(CEP.val()).replace(/(\.)|(\-)|(\ )/g,"")+'/json/ ',
					beforeSend: (data)=>{
						if(typeof swal == "function"){
							swal.fire({
								title: 'Buscando Informações do CEP',
								text: 'Aguarde',
								didOpen: () => {
								  swal.showLoading()
								},
								allowOutsideClick: false
							});
						}
						console.log(data);
					},
					error: (erro)=>{
					    if (erro == "timeout") {
					    	toastr.error('Desculpe o tempo da requisição esgotou, tente novamente mais tarde', 'Ops!');
					    } else {
					    	toastr.error('Algo deu errado, tente novamente e caso persista entre contato conosco', 'Ops!');
					    }
					},      
					success: (retorno)=>{
						if(typeof swal == "function"){
							swal.close();
						}	            	
					    retorno = JSON.parse(retorno);
					    viaCEP.gravaCache(retorno);
					    $.each(retorno, function(index, value){
					    	if(index != "cep"){
						    	viaCEP.defineValorCampo(index, value);
					    	}
						});
					}
				})
			}

	})

	$(window).on("beforeunload", function() { 
	    viaCEP.limpaCache();
	})

})