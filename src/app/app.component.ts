import { Component } from '@angular/core';
const csv2json = require('../csv2json.js');
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'splittool';

  file: File;

  selectFile(event): void {
    this.file = event.target.files[0];
  }

  removeEmptyRows(value){
    return value.trim().length > 0;
  }
  generateReport(){

    try{


    var mapofRowsWithSplitData = new Map();
    let splitArrayOfObject = [];
    const reader = new FileReader();
    reader.readAsText(this.file);

    reader.onload = () => {
      const text = reader.result;

      let json = csv2json(text, {parseNumbers: true});

      let itrIndex;
        for(let i = 0 ; i < json.length;i++){

      let Obj = json[i];

      let pluginoutput =Obj['Plugin Output'];



        if(pluginoutput.split('\n')[1] == undefined){
          continue;
        }
        let secondline = pluginoutput.split('\n')[1].trim();
      if(secondline.startsWith('Nessus')){

        let substringFromSecondLine = pluginoutput.substring(16);

        let jsondatastring = substringFromSecondLine.substr(substringFromSecondLine.indexOf(':')+1).trim();

        let jsondataarray = jsondatastring.split('\n');

        jsondataarray = jsondataarray.filter(this.removeEmptyRows);


        let startindexofpath = 0;



        let tempJsonObj = {};
        let lineData = jsondataarray[startindexofpath].trim().split(':');
        let key = lineData[0].trim();
        let value = lineData[1].trim();

        tempJsonObj[key] = value;



       for(itrIndex = 1;itrIndex<jsondataarray.length;itrIndex++){

          let lineData = jsondataarray[itrIndex].trim();
          let lineKeydata = lineData.split(':')[0].trim();
          let lineValuedata = lineData.split(':')[1].trim();

        if(lineKeydata.startsWith('Path')){


         splitArrayOfObject.push(tempJsonObj);

         tempJsonObj={};
         tempJsonObj[lineKeydata] = lineValuedata;

        }else{
          tempJsonObj[lineKeydata] = lineValuedata;
        }

       }

       splitArrayOfObject.push(tempJsonObj);
      }else if(secondline.startsWith('Path')){
        let substringFromSecondLine = pluginoutput.substring(16);
        let jsondataarray = substringFromSecondLine.split('\n');

        let tempObj = {};
        for(let i = 0;i <jsondataarray.length;i++){

          let row  = jsondataarray[i];
          let rowsplit = row.split(':');

          let key = rowsplit[0].trim();
          let value = rowsplit[1].trim();
          tempObj[key] = value;

        }
        splitArrayOfObject.push(tempObj);

      }
      mapofRowsWithSplitData.set(i,splitArrayOfObject);
      splitArrayOfObject = [];

    }

    let finalResultarray = [];
   for(let i = 0;i< json.length;i++){

    let Obj = json[i];

    let log4jinstallsdataobj = mapofRowsWithSplitData.get(i);

    log4jinstallsdataobj.forEach(element => {

      element["IP Address"]=Obj["IP Address"]
      element["DNS Name"]=Obj["DNS Name"]

    });

    finalResultarray = [...finalResultarray, ...log4jinstallsdataobj];


   }

   const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(finalResultarray);
   /* generate workbook and add the worksheet */
   const wb: XLSX.WorkBook = XLSX.utils.book_new();
   XLSX.utils.book_append_sheet(wb, worksheet, 'Sheet1');
   /* save to file */
   XLSX.writeFile(wb, "datasheet.xlsx");


  }


}
catch(e){
  window.alert("there was a error in the file - Please correct the file data and re upload")
}


  }



}

