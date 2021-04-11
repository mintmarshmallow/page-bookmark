/*
costfW = i_pow_sum+'*x^2/n/50 + '
+2*i_sum*(b_sum-y_sum)+'*x/n/50+'
+(b_pow_sum -2*y_sum*b_sum+y_pow_sum/n/50+100);
*/
W = ggbApplet.getValue("W");
b = ggbApplet.getValue("b");
costfW = '';
i_pow_sum = 0;
i_sum = 0;
y_sum = 0;
yi_sum = 0;
y_pow_sum = 0;
b_pow_sum =0
b_sum = 0;
W_sum = 0;
W_pow_sum =0;
for (var i = 0; i< n;i++){
    y_val = ggbApplet.getYcoord('A_'+i)
    cost+= Math.pow((W*i + b -y_val), 2);
    i_pow_sum += Math.pow(i, 2);
    yi_sum += y_val*i;
    y_sum += y_val;
    y_pow_sum += Math.pow(y_val,2);
    b_pow_sum += Math.pow(b, 2);
b_sum += b;
W_sum += W;
W_pow_sum += Math.pow(W, 2);

costfW += '(x*'+i+'+b+'+y_val+')^2+'
}
cost  = cost/n/50;


ggbApplet.evalCommand("costfW(x) = "+costfW);


ggbApplet.evalCommand("COSTW = ("+(W*10-50)+","+ cost+")");
ggbApplet.evalCommand("COSTB = ("+(b*100-100)+","+ cost+")");
