export function convertLyrics(lyricsData) {
    // 使用正则表达式匹配歌词数据中的时间和文本
    var regex = /\[(\d+:\d+\.\d+)\](.*)/g;
    var match;
    var convertedLyrics = [];
  
    while ((match = regex.exec(lyricsData)) !== null) {
      var timeString = match[1]; // 匹配到的时间字符串，例如 '00:00.00'
      var txt = match[2].trim(); // 匹配到的文本，去除首尾空格
  
      // 将时间字符串转换成以毫秒为单位的时间
      var timeParts = timeString.split(':');
      var minutes = parseInt(timeParts[0], 10);
      var seconds = parseFloat(timeParts[1]);
      var time = Math.round((minutes * 60 + seconds) * 1000);
  
      // 构造转换后的对象
      var convertedLine = {
        time: time,
        txt: txt
      };
  
      // 将转换后的对象添加到结果数组中
      if(convertedLine.txt!='')
      convertedLyrics.push(convertedLine);
    }
  
    return convertedLyrics;
  }

