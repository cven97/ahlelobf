

var formul = "( 10 + 12 ) * 2 + x + sin(12)"

var valeur = formul.split(' ')


function calcul(formul, x) {
    var valeur = formul.split(' ');
    var valRecup = 0;
    var tmp = 0;
    var ancienneVal = 0;
    var nouvelValeur = 0;
    var operateur = '';
    let i = 1;
    var ParOuver = 0;
    var n = 0
 

    valeur.forEach(element => {
        if (isNaN(element) && element != 'x' && (!element.startsWith('sin')) && (!element.startsWith('cos')) && (!element.startsWith('exp'))) {
            if (element != '(' && element != ')') {
                    operateur = element
            }
        }
        else {

            // && ((element = 'x') || (element.startsWith('sin')) || (element.startsWith('cos')) || (element.startsWith('exp')))

            if (isNaN(element)) {

                if (element == 'x')
                    nouvelValeur = x;
                else{

                    tmp = element.split('(').join('#').split(')').join('#').split('#',2);

                    if(tmp[0].startsWith('sin')){
                        console.log('sinus')
                        if(tmp[1] == 'x')
                            valRecup = Math.sin(x)
                        else
                            valRecup = Math.sin(parseInt(tmp[1]))

                            valRecup = Math.abs( parseInt(10*valRecup))
                        
                            console.log(valRecup)
                    }

                    if(tmp[0].startsWith('cos')){
                        console.log('cosinus')
                    }

                    if(tmp[0].startsWith('exp')){
                        console.log('expo')
                    }
                }
            }
            else{
                valRecup = parseInt(element)
                console.log("ok")
            }

            if (n == 0) {
                ancienneVal = valRecup
                n = 1

            }
            else {
                nouvelValeur = valRecup

                    switch (operateur) {
                        case '+':
                            ancienneVal += nouvelValeur
                            break;

                        case '-':
                            ancienneVal -= nouvelValeur
                            break;

                        case '*':
                            ancienneVal *= nouvelValeur
                            break;

                        case '/':
                            ancienneVal /= nouvelValeur
                            break;

                        default:
                            break;
                    }

                }

        }

    });
    console.log(valeur)
    console.log(ancienneVal)
}

