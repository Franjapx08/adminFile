var App = new Vue({
  el: "#app",
  data() {
    return {
      mensaje: "",
      datos: [],
      link: ["/Users/franj/Proyectos"],
      arri: "",
      texto: "",
      text: "",
      mostrar: false,
      textAr: "",
      textFil: "",
      copiarArchi: "",
      check: false,
      boton: false,
      data: "",
      name: ""
    };
  },
  created() {
    fs.readdirSync(this.link.join("/")).forEach((e, i) => {
      this.datos[i] = {};
      this.datos[i].nombre = e;
      if (fs.statSync(this.link.join("/") + "/" + e).isDirectory()) {
        this.datos[i].tipo = "Directorio";
      } else {
        this.datos[i].tipo = "Archivo";
      }
      this.datos[i].size = fs.statSync(this.link.join("/") + "/" + e).size;
      this.datos[i].fecha = fs.statSync(this.link.join("/") + "/" + e).atime;
    });
    console.log(this.datos);
  },
  watch: {
    link() {
      fs.readdirSync(this.link.join("/")).forEach((e, i) => {
        this.$set(this.datos, i, {}); //Agrega un JSON en la posición i de datos
        this.$set(this.datos[i], "nombre", e); // Al JSON creado se agrega nombre
        if (fs.statSync(this.link.join("/") + "/" + e).isDirectory()) {
          // Se valida si es carpeta o archivo
          this.$set(this.datos[i], "tipo", "carpeta"); // Se agrega al JSON el tipo carpeta
        } else {
          this.$set(this.datos[i], "tipo", "archivo"); // Se agrega al JSON el tipo archivo
        }
      });
    }
  },
  methods: {
    clickRow(n, t) {
      if (t == "carpeta") {
        this.link.push(n);
        console.log(this.link.join("/"));

        this.arri = this.link.join("/");
        // console.log(ruta.join(this.link.join('/'), n));
      } else {
        console.log("ruta --> ");
        //electron.shell.openItem(ruta.join(this.link.join("/"), n));
        console.log(ruta.join(this.link.join("/"), n));
      }
    },
    back(event) {
      if (this.link.length > 1) {
        this.link.pop();
      }
    },
    eliminar(n, t) {
      console.log(n);
      if (t == "archivo") {
        fs.unlink(this.link.join("/") + "/" + n, err => {
          if (!err) {
            this.recargar();
          } else {
            this.mensaje = "Error";
          }
          //error
        });
      } else {
        rmrf(this.link.join("/") + "/" + n, err => {
          if (!err) {
            this.recargar();
          } else {
            this.mensaje = "Error";
          }
        });
      }
    },
    modificar(x, t) {
      this.mostrar = true;
      console.log(x);
      console.log(t);

      // console.log(this.texto);
      var content = "ilex";

      fs.rename(
        this.link.join("/") + "/" + x,
        this.link.join("/") + "/" + t,
        err => {
          if (!err) {
            this.recargar();
          } else {
            this.mensaje = "Nombre en uso";
          }
        }
      );
    },
    folder(t) {
      try {
        fs.mkdirSync(this.link.join("/") + "/" + t);
      } catch (err) {
        if (err.code == "EEXIST") {
          console.log(err);
          this.mensaje = "Nombre en uso";
        } else {
          this.recargar();
          this.textAr = "";
        }
      }
    },
    file(t) {
      fs.createWriteStream(this.link.join("/") + "/" + t, err => {
        if (!err) {
          this.textFil = "";
          this.recargar();
        } else {
          this.mensaje = "Nombre en uso";
        }
      });
    },
    recargar() {
      let x = this.link;
      this.link = [];
      this.link = x;
    },
    copiarArch(e) {
      this.boton = true;
      console.log("file");
      this.copiarArchi = this.link.join("/") + "/" + e;
      console.log(this.copiarArchi);
      this.name = e;

      // this.data = fss.copyFile(this.link.join('/') + '/' + e, (err) =>{
      /*   fss.copy(this.link.join('/') + '/' + e  , this.link.join('/') + '/' + 'panochita' + '/'  + e , (err) =>{
            if(!err){
             // this.textFil = ''  
              this.recargar()
              console.log(err);
             // console.log(p);
              
            }else{
             this.mensaje = 'Nombre en uso'
             this.recargar()
           
            }
            
        })
        */
    },
    pegar() {
      console.log(this.copiarArchi);
      console.log(this.arri);

      console.log(this.name);
      fss.copy(this.copiarArchi, this.arri + "/" + this.name, err => {
        if (!err) {
          // this.textFil = ''
          this.recargar();
          console.log(err);
          // console.log(p);
          this.boton = false;
        } else {
          this.mensaje = "Nombre en uso";
          this.recargar();
        }
      });
      this.boton = false;
      this.recargar();
    },
    copiarCarpeta(e) {
      console.log("carpeta");

      this.boton = true;
      console.log("file");
      this.copiarArchi = this.link.join("/") + "/" + e;
      console.log(this.copiarArchi);
      this.name = e;
    }
  }
});
