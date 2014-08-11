/**
纵向的滚动
	Scroller
	【constructor】
	Scroller({
		container:"#scrollerContainer",
		list:"#scrollerList",
		listItem:"img",
		countPerScroll:[每块的宽度/容器宽度],
		clickChange:true,
		scrollByMutipleUnit:[true|false]   //是否以一个单元的倍数滚动
	})
	【方法】
	init(index)
	(Bool changed)selectItemByIndex(index,redirect【是否直接到位，不执行动画】)
	(Object)getSelectedItem()
	(Number)getSelectedIndex()
	scrollNext()
	scrollPrev()
	goNext()
	goPrev()
	(Number)appendItem(item)
	(Number)prependItem(item)
	removeItemByIndex()
	
	【事件监听】
	onScroll({canPrev:Bool,canNext:Bool,name:[next|prev|init],nextIsEnd:Bool,prevIsEnd:Bool,visibleItems:[]})【init方法在执行时，一定会触发onScroll方法，name属性为init】
	onChange({canPrev:Bool,canNext:Bool,item:Object})
	onScrollStatusChange({canGoPrev:Bool,canGoNext:Bool,canScrollPrev:Bool,canScrollNext:Bool,name:[scrollPrev|scrollNext|goPrev|goNext]})
	beforeScroll({canPrev:Bool,canNext:Bool,name:[beforeScroll],nextIsEnd:Bool,prevIsEnd:Bool,visibleItems:[]})【参数都是scroll完成时的状态，而不是当前的】
	【说明】
	1. 提供底层功能的实现和scroll状态的事件通知，可以此为基础进行高级调用
	2. 提供接口为支持图片懒加载与指定图片预览


*/
KISSY.add('script/scrollerv',function(S){
function Scroller(conf){
	var config={//
		scrollOnEdge:true,
		scrollByMutipleUnit:false
	};
	for(var k in conf){
		config[k]=conf[k];
	}
	var CONST_KEY_INDEX='itemIndex',
		CONST_KEY_INVALID_SCROLL='invalidScroll',
		$=S.all,
		_self=this,
		_initialized=false,
		_container=S.one(config.container),
		_list=config.list?S.one(config.list):_container.children(),
		_itemsArray=[],
		_items=config.listItem?_list.all(config.listItem):_list.children(),
		_selectedIndex,
		_currentSelectedItem,
		_unitHeight=$(_items[0]).outerHeight(true),
		_scrollDistance=_unitHeight*(config.countPerScroll||Math.floor(_container.height()/_unitHeight)),
		_scrollMutiple=config.scrollByMutipleUnit,
		_canGoPrev=true,
		_canGoNext=true,
		_canScrollPrev=true,
		_canScrollNext=true,
		_checkScrollStatus=function(){
			var div=_container[0],sL=div.scrollTop!=0,sR=div.scrollHeight>div.clientHeight+div.scrollTop,
			gL=_selectedIndex>0,gR=_selectedIndex<_getItemsLength()-1;
			if(sL!=_canScrollPrev){
				_canScrollPrev=sL;
				_sendScrollStatusEvent('scrollPrev');
				
			}
			if(sR!=_canScrollNext){
				_canScrollNext=sR;
				_sendScrollStatusEvent('scrollNext');
			}
			if(gL!=_canGoPrev){
				_canGoPrev=gL;
				_sendScrollStatusEvent('goPrev');
			}
			if(gR!=_canGoNext){
				_canGoNext=gR;
				_sendScrollStatusEvent('goNext');
			}

		},
		_sendEvent=function(name,data){
			var fn=_self[name];
			if(typeof fn=='function'){
				fn.call(_self,data);
			}
		},
		_sendScrollStatusEvent=function(name){
			_sendEvent('onScrollStatusChange',{
					canGoPrev:_canGoPrev,
					canGoNext:_canGoNext,
					canScrollPrev:_canScrollPrev,
					canScrollNext:_canScrollNext,
					name:name
				});
		},
		_scrollBeforeSendEvent=function(sl){
			var data=_getScrollParams(sl);
			data.name="beforeScroll";
			_sendEvent('beforeScroll',data);
		},
		_scrollDoneSendEvent=function(name){
			var data=_getScrollParams();
			data.name=name;
			_sendEvent('onScroll',data);
		},
		_scrollNextDone=function(code){
			if(code!=CONST_KEY_INVALID_SCROLL){
				_scrollDoneSendEvent("next");
			}
			_checkScrollStatus();
			
		},
		_scrollPrevDone=function(code){
			if(code!=CONST_KEY_INVALID_SCROLL){
				_scrollDoneSendEvent("prev");
			}
			_checkScrollStatus();
		},
		_selectIndex=function(idx){
			if(_selectedIndex==idx){
				return false;
			}
			idx=Math.max(0,Math.min(idx,_itemsArray.length-1));
			_selectedIndex=idx;
			if(_currentSelectedItem)_currentSelectedItem.removeClass('selected');
			_currentSelectedItem=$(_itemsArray[_selectedIndex]);
			_currentSelectedItem.addClass('selected');
			_sendChangeEvent();
			return true;
		},
		_refreshScroll=function(redirect){
			var box=positionInContainer(_currentSelectedItem,_container),dis=_scrollDistance/2,compareHeight=config.scrollOnEdge?_unitHeight:0;
			if(box.bottom<compareHeight){
				if(redirect)_redirect(dis+Math.abs(box.bottom));
				else{
					scrollNext(dis+Math.abs(box.bottom));	
				}
				
			}
			if(box.top<compareHeight){
				if(redirect)_redirect(0-dis-Math.abs(box.top));
				else{
					scrollPrev(dis+Math.abs(box.top));
				}
			}
		},
		_sendChangeEvent=function(){
			_sendEvent('onChange',{
					item:_currentSelectedItem,
					index:_selectedIndex,
					canPrev:	_selectedIndex>0,
					canNext: _selectedIndex<_getItemsLength()-1
				});
		},
		selectItemByIndex=function(idx,redirect){
			if(!_selectIndex(idx)){return false;}
			_refreshScroll(redirect);
			_checkScrollStatus();
			return true;
		},
		_getScrollParams=function(sl){
			var div=_container[0],sl=(sl===undefined)?div.scrollTop:Math.max(0,Math.min(div.scrollHeight,sl)),remain=div.scrollHeight-div.clientHeight-sl
			return {
				canPrev:sl!=0,
				canNext:remain>0,
				nextIsEnd:remain<=_scrollDistance,
				prevIsEnd:sl<=_scrollDistance,
				visibleItems:_getVisibleItems(sl)
			};
		},
		_getVisibleItems=function(sl){//计算显示的元素，忽略padding
			var div=_container[0],l=(sl===undefined)?div.scrollTop:sl,w=div.clientHeight,sw=div.scrollHeight,len=_getItemsLength(),
				leftCount=Math.floor(len*l/sw),rightCount=Math.floor(len*(sw-l-w)/sw);
			return _itemsArray.slice(leftCount,len-rightCount);
		},
		_getItemsLength=function(){
			return _itemsArray.length;
		},
		getSelectedItem=function(){
			return _currentSelectedItem;
		},
		getSelectedIndex=function(){
			return _currentSelectedItem.data(CONST_KEY_INDEX);
		},
		_redirect=function(dis){
			var div=_container[0],ori=div.scrollTop;
			if(_scrollMutiple){
				dis=Math.round(dis/_unitHeight)*_unitHeight;
			}
			div.scrollTop+=dis;
			if(div.scrollTop!=ori){
				_scrollDoneSendEvent(dis>0?"next":"prev");
			}
			_checkScrollStatus();
		},
		scrollNext=function(dis){
			var div=_container[0],start=div.scrollTop,dis=dis||_scrollDistance;
			if(div.scrollHeight>div.clientHeight+div.scrollTop){
				if(_scrollMutiple){
					dis=Math.round(dis/_unitHeight)*_unitHeight;
				}
				_scrollBeforeSendEvent(start+dis);
				doScroll(div,start,start+dis,_scrollNextDone);
			}else{
				_scrollNextDone(CONST_KEY_INVALID_SCROLL);
			}
			
		},
		scrollPrev=function(dis){
			var div=_container[0],start=div.scrollTop,dis=dis||_scrollDistance;
			if(start>0){
				if(_scrollMutiple){
					dis=Math.round(dis/_unitHeight)*_unitHeight;
				}
				_scrollBeforeSendEvent(start-dis);
				doScroll(div,start,start-dis,_scrollPrevDone);
			}else{
				_scrollPrevDone(CONST_KEY_INVALID_SCROLL);
			}
			
		},appendItem=function(item){
			_itemsArray=_itemsArray.concat([].slice.call($(item).appendTo(_list),0));
			_cacheIndex();
			_checkScrollStatus();
			return _itemsArray.length-1;
		},prependItem=function(item){
			var item=$(item),
				len=item.prependTo(_list).length;
			_itemsArray=[].slice.call(item,0).concat(_itemsArray);
			_cacheIndex();
			//_refreshScroll(true);
			_container[0].scrollTop+=_unitHeight*len;
			_selectedIndex+=len;
			_checkScrollStatus();
			return 0;
		},removeItemByIndex=function(idx){
			var item=_itemsArray.splice(idx,1);
			//_list.prepend(item);
			$(item).remove();
			if(!_itemsArray.length){
				_sendEvent('onEmpty');
				return;
			}
			_selectedIndex=-1;
			_selectIndex(idx);
			_cacheIndex();
			_checkScrollStatus();
			_sendEvent('onItemDeleted',{name:'deleted',visibleItems:_getVisibleItems()});
			
		},_cacheIndex=function(){
			S.each(_itemsArray,function(n,i){
				$(n).data(CONST_KEY_INDEX,i);
				//$(n).attr(CONST_KEY_INDEX,i);
			});
		},_walk=function(reverse){
			var idx=_selectedIndex;
			if(reverse){
				if(idx>0)idx-=1;
			}else {
				if(idx<_itemsArray.length-1)idx+=1;
			}
			selectItemByIndex(idx);
		},__init=function(){
			S.each(_items,function(n,i){
				_itemsArray[i]=n;
			});
			_cacheIndex();
			
			_container.on('click',function(ev){
				var n=$(ev.target);
				//alert(typeof n.test);
				if(config.listItem&&n.test(config.listItem)||!config.listItem&&n.parent()[0]===_list[0]){//DOM.test方法不支持父子或兄弟级别
					selectItemByIndex(n.data(CONST_KEY_INDEX));
				}
			});
		

		};

	_self.selectItemByIndex=selectItemByIndex;
	_self.getSelectedItem=getSelectedItem;
	_self.getSelectedIndex=getSelectedIndex;
	_self.scrollNext=scrollNext;
	_self.scrollPrev=scrollPrev;
	_self.appendItem=appendItem;
	_self.prependItem=prependItem;
	_self.removeItemByIndex=removeItemByIndex;
	_self.goNext=_walk;
	_self.goPrev=function(){_walk(true)}
	_self.init=function(idx){
		if(_initialized)return _self;
		selectItemByIndex(idx,true);
		_scrollDoneSendEvent("init");
		_initialized=true;

	};
	
	__init();
	
}
//基础方法-使容器向左滚动
function doScroll(div,start,aim,callback){
	var aim=Math.min(div.scrollHeight-div.clientHeight,Math.max(aim,0)), dis=aim-start, span=Math.abs(dis), speed=span>50?(dis/5):(dis>0?5:-5);//加快速度，距离越远速度越大
	if(span>Math.abs(speed)){
		start+=speed;
		div.scrollTop=start;
		setTimeout(function(){
			doScroll(div,start,aim,callback);
		},10);
	}else{
		div.scrollTop=aim;
		if(typeof callback=='function'){
			callback();
		}
	}

}
//一个元素在容器中的位置
function positionInContainer(item,container){
	var itemOffset=item.offset(),containerOffset=container.offset();
	
	return {
		left:itemOffset.left-containerOffset.left,
		right:(containerOffset.left+container.width())-(itemOffset.left+item.width()),
		top:itemOffset.top-containerOffset.top,
		bottom:(containerOffset.top+container.height())-(itemOffset.top+item.height())
	};
	
}

return Scroller;
},{
	requires:['event','node'] // 该模块的一些依赖项,
});