function fmt(n){return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');}
function parseDate(s){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s)){return null;}
  var p=s.split('-'),y=parseInt(p[0],10),m=parseInt(p[1],10)-1,d=parseInt(p[2],10);
  var dt=new Date(y,m,d);
  if(dt.getFullYear()!==y||dt.getMonth()!==m||dt.getDate()!==d){return null;}
  return dt;
}
function setErr(id,msg){
  var f=$('#'+id),e=$('#e_'+id);
  if(msg===''){f.removeClass('bad');e.text('');return true;}
  f.addClass('bad');e.hide().text(msg).fadeIn(300);return false;
}
function checkName(){
  var v=$.trim($('#fname').val());
  if(v===''){return setErr('fname','');}
  return setErr('fname',/^[\u0621-\u064A]+( [\u0621-\u064A]+)+$/.test(v)?'':'اكتب الاسم الكامل بأحرف عربية فقط (كلمتان على الأقل).');
}
function checkNid(){
  var v=$.trim($('#nid').val()),ok=true,msg='';
  if(v===''){ok=false;msg='الرقم الوطني إلزامي.';}
  else if(!/^\d{11}$/.test(v)){ok=false;msg='الرقم الوطني يتكون من 11 رقمًا.';}
  else{var c=parseInt(v.substring(0,2),10);if(c<1||c>14){ok=false;msg='أول رقمين يجب أن يكونا بين 01 و14.';}}
  return setErr('nid',msg);
}
function checkDates(){
  var s=$.trim($('#sdate').val()),e=$.trim($('#edate').val()),ok=true,ds=null,de=null;
  if(s===''){ok=setErr('sdate','تاريخ البداية إلزامي.');}
  else{ds=parseDate(s);ok=setErr('sdate',ds?'':'الصيغة المطلوبة yyyy-mm-dd وتاريخ صحيح.');}
  if(e===''){ok=setErr('edate','تاريخ النهاية إلزامي.')&&ok;}
  else{de=parseDate(e);
    if(!de){ok=setErr('edate','الصيغة المطلوبة yyyy-mm-dd وتاريخ صحيح.')&&false;}
    else if(ds&&de<=ds){ok=setErr('edate','تاريخ النهاية يجب أن يكون لاحقًا لتاريخ البداية.')&&false;}
    else{setErr('edate','');}}
  return ok&&ds!==null&&de!==null&&de>ds;
}
function checkMobile(){
  var v=$.trim($('#mobile').val());
  if(v===''){return setErr('mobile','');}
  return setErr('mobile',/^09[345689]\d{7}$/.test(v)?'':'رقم غير صالح لشبكتي Syriatel أو MTN (مثال: 0933123456).');
}
function checkEmail(){
  var v=$.trim($('#email').val());
  if(v===''){return setErr('email','');}
  return setErr('email',/^[\w.\-]+@[\w\-]+(\.[\w\-]+)+$/.test(v)?'':'البريد الإلكتروني غير صحيح.');
}
function showResult(){
  var days=Math.round((parseDate($.trim($('#edate').val()))-parseDate($.trim($('#sdate').val())))/86400000);
  var total=0,rows='';
  $('input.sel:checked').each(function(){
    var tr=$(this).closest('tr'),price=parseInt(tr.find('td.price').text().replace(/\D/g,''),10);
    var cost=price*days;total+=cost;
    rows+='<tr><td>'+tr.find('td.model').text()+'</td><td>'+days+'</td><td>'+fmt(cost)+' ل.س</td></tr>';
  });
  var disc=0;
  if(days>7){disc=total*0.10;}
  var html='<p>اسم مقدم الطلب: '+($.trim($('#fname').val())||'-')+'</p>'+
    '<table><thead><tr><th>السيارة</th><th>الأيام</th><th>الأجرة</th></tr></thead><tbody>'+rows+'</tbody></table>'+
    '<p>المجموع: '+fmt(total)+' ل.س</p><p>الخصم (10% لمدة تزيد على 7 أيام): '+fmt(disc)+' ل.س</p>'+
    '<p class="tot">المبلغ النهائي: '+fmt(total-disc)+' ل.س</p>';
  $('#resBody').html(html);
  $('#overlay').fadeIn(300);
}

$(document).ready(function(){
  $('.card').hide().each(function(i){$(this).delay(i*180).fadeIn(700);});
  
  $(document).on('click','.btn',function(e){
    var b=$(this),o=b.offset(),r=$('<span class="ripple"></span>').css({left:e.pageX-o.left,top:e.pageY-o.top});
    b.append(r);setTimeout(function(){r.remove();},600);
  });

  $('a.go').click(function(e){
    var url=$(this).attr('href');e.preventDefault();
    $('body').addClass('leaving');setTimeout(function(){window.location.href=url;},400);
  });

  $('#exitLink').click(function(e){
    e.preventDefault();
    if(window.confirm('هل تريد مغادرة موقع Eagle Luxe وإغلاقه؟')){
      $('body').addClass('leaving');
      setTimeout(function(){
        try { window.close(); } catch(err) {}
        window.location.href = 'about:blank';
      }, 400);
    }
  });

  // إغلاق التفاصيل السابقة عند فتح جديدة
  $(document).on('change', 'input.det', function(){
    var currentCheckbox = this;
    var row = $(this).closest('tr').next('tr.drow');
    var box = row.find('.dbox');
    
    if(currentCheckbox.checked){
      $('input.det').not(currentCheckbox).each(function(){
        if(this.checked){
          this.checked = false;
          var r = $(this).closest('tr').next('tr.drow');
          r.find('.dbox').slideUp(200, function(){ r.hide(); });
        }
      });
      row.css('display', 'table-row');
      box.hide().slideDown(400);
    } else {
      box.slideUp(300, function(){ row.hide(); });
    }
  });

  // مراقبة اختيار السيارات: إذا لم يحدد أي سيارة، يختفي نموذج الحجز تلقائياً
  $(document).on('change', 'input.sel', function(){
    if($('input.sel:checked').length === 0){
      $('#bookingSec').fadeOut(300);
    }
  });

  // الانتقال المتزامن والتلاشي الأنيق بين المجموعتين دون أي قفز
  var currentFleetGroup = 1;
  $('#toggleFleetBtn').click(function(){
    $('input.det:checked').prop('checked', false);
    $('.drow').hide();
    $('.dbox').hide();

    if(currentFleetGroup === 1) {
      $('.fleet-group-1').fadeOut(400, function(){
        $('.fleet-group-2').fadeIn(400);
        currentFleetGroup = 2;
        $('#toggleFleetBtn').text('إظهار الخيارات الأولى');
      });
    } else {
      $('.fleet-group-2').fadeOut(400, function(){
        $('.fleet-group-1').fadeIn(400);
        currentFleetGroup = 1;
        $('#toggleFleetBtn').text('إظهار المزيد من الخيارات');
      });
    }
  });

  $('#goBtn').click(function(){
    var names=[];
    $('input.sel:checked').each(function(){names.push($(this).closest('tr').find('td.model').text());});
    if(names.length===0){$('#selMsg').hide().text('اختر سيارة واحدة على الأقل.').fadeIn(300);return;}
    $('#selMsg').text('');
    $('#chosen').text(names.join(' ، '));
    $('#bookingSec').fadeIn(500,function(){$('html,body').animate({scrollTop:$('#bookingSec').offset().top-80},600);});
  });

  $('#fname').blur(checkName);$('#nid').blur(checkNid);$('#mobile').blur(checkMobile);$('#email').blur(checkEmail);
  $('#sdate,#edate').blur(checkDates);
  $('#bookForm').submit(function(e){
    e.preventDefault();
    var a=checkName(),b=checkNid(),c=checkDates(),d=checkMobile(),f=checkEmail();
    if(a&&b&&c&&d&&f){showResult();}
  });
  $('#closeRes').click(function(){$('#overlay').fadeOut(300);});
});