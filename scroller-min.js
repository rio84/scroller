KISSY.add("script/scroller",function(c){function b(Q){var J={scrollOnEdge:true,scrollByMutipleWidth:false};for(var S in Q){J[S]=Q[S]}var M="itemIndex",u="invalidScroll",H=c.all,o=this,B=false,x=c.one(J.container),A=J.list?c.one(J.list):x.children(),h=[],C=J.listItem?A.all(J.listItem):A.children(),X,e,g=H(C[0]).outerWidth(true),I=g*(J.countPerScroll||Math.floor(x.width()/g)),n=J.scrollByMutipleWidth,F=true,Y=true,p=true,K=true,s=function(){var ac=x[0],ab=ac.scrollLeft!=0,Z=ac.scrollWidth>ac.clientWidth+ac.scrollLeft,aa=X>0,k=X<l()-1;if(ab!=p){p=ab;O("scrollPrev")}if(Z!=K){K=Z;O("scrollNext")}if(aa!=F){F=aa;O("goPrev")}if(k!=Y){Y=k;O("goNext")}},r=function(k,aa){var Z=o[k];if(typeof Z=="function"){Z.call(o,aa)}},O=function(k){r("onScrollStatusChange",{canGoPrev:F,canGoNext:Y,canScrollPrev:p,canScrollNext:K,name:k})},N=function(k){var Z=z(k);Z.name="beforeScroll";r("beforeScroll",Z)},U=function(k){var Z=z();Z.name=k;r("onScroll",Z)},v=function(k){if(k!=u){U("next")}s()},j=function(k){if(k!=u){U("prev")}s()},P=function(k){if(X==k){return false}k=Math.max(0,Math.min(k,h.length-1));X=k;if(e){e.removeClass("selected")}e=H(h[X]);e.addClass("selected");m();return true},y=function(ab){var Z=d(e,x),k=I/2,aa=J.scrollOnEdge?g:0;if(Z.right<aa){if(ab){f(k+Math.abs(Z.right))}else{w(k+Math.abs(Z.right))}}if(Z.left<aa){if(ab){f(0-k-Math.abs(Z.left))}else{V(k+Math.abs(Z.left))}}},m=function(){r("onChange",{item:e,index:X,canPrev:X>0,canNext:X<l()-1})},R=function(k,Z){if(!P(k)){return false}y(Z);s();return true},z=function(k){var aa=x[0],k=(k===undefined)?aa.scrollLeft:Math.max(0,Math.min(aa.scrollWidth,k)),Z=aa.scrollWidth-aa.clientWidth-k;return{canPrev:k!=0,canNext:Z>0,nextIsEnd:Z<=I,prevIsEnd:k<=I,visibleItems:t(k)}},t=function(aa){var af=x[0],ac=(aa===undefined)?af.scrollLeft:aa,ab=af.clientWidth,Z=af.scrollWidth,k=l(),ad=Math.floor(k*ac/Z),ae=Math.floor(k*(Z-ac-ab)/Z);return h.slice(ad,k-ae)},l=function(){return h.length},E=function(){return e},G=function(){return e.data(M)},f=function(k){var aa=x[0],Z=aa.scrollLeft;if(n){k=Math.round(k/g)*g}aa.scrollLeft+=k;if(aa.scrollLeft!=Z){U(k>0?"next":"prev")}s()},w=function(k){var aa=x[0],Z=aa.scrollLeft,k=k||I;if(aa.scrollWidth>aa.clientWidth+aa.scrollLeft){if(n){k=Math.round(k/g)*g}N(Z+k);a(aa,Z,Z+k,v)}else{v(u)}},V=function(k){var aa=x[0],Z=aa.scrollLeft,k=k||I;if(Z>0){if(n){k=Math.round(k/g)*g}N(Z-k);a(aa,Z,Z-k,j)}else{j(u)}},L=function(k){h=h.concat([].slice.call(H(k).appendTo(A),0));T();s();return h.length-1},D=function(Z){var Z=H(Z),k=Z.prependTo(A).length;h=[].slice.call(Z,0).concat(h);T();x[0].scrollLeft+=g*k;X+=k;s();return 0},i=function(k){var Z=h.splice(k,1);H(Z).remove();if(!h.length){r("onEmpty");return}X=-1;P(k);T();s();r("onItemDeleted",{name:"deleted",visibleItems:t()})},T=function(){c.each(h,function(Z,k){H(Z).data(M,k)})},q=function(Z){var k=X;if(Z){if(k>0){k-=1}}else{if(k<h.length-1){k+=1}}R(k)},W=function(){c.each(C,function(Z,k){h[k]=Z});T();x.on("click",function(k){var Z=H(k.target);if(J.listItem&&Z.test(J.listItem)||!J.listItem&&Z.parent()[0]===A[0]){R(Z.data(M))}})};o.selectItemByIndex=R;o.getSelectedItem=E;o.getSelectedIndex=G;o.scrollNext=w;o.scrollPrev=V;o.appendItem=L;o.prependItem=D;o.removeItemByIndex=i;o.goNext=q;o.goPrev=function(){q(true)};o.init=function(k){if(B){return o}R(k,true);U("init");B=true};W()}function a(k,j,h,i){var h=Math.min(k.scrollWidth-k.clientWidth,Math.max(h,0)),e=h-j,f=Math.abs(e),g=f>50?(e/5):(e>0?5:-5);if(f>Math.abs(g)){j+=g;k.scrollLeft=j;setTimeout(function(){a(k,j,h,i)},10)}else{k.scrollLeft=h;if(typeof i=="function"){i()}}}function d(g,e){var h=g.offset(),f=e.offset();return{left:h.left-f.left,right:(f.left+e.width())-(h.left+g.width()),top:h.top-f.top,bottom:(f.top+e.height())-(h.top+g.height())}}return b});