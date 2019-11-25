Vue.component("modal", {
  template: "#modal-template"
});

var App = new Vue({
  el: "#app",
  data() {
    return {
      estado: ["Raiz"],
      datos: [],
      link: ["/Users/franj/Proyectos/Pruebas"],
      anterior: [],
      button: true,
      showModal: false,
      formCarpeta: null,
      formArchivo: null,
      formCambiarNombre: null,
      formBusqueda: null,
      mensajeSearch: "",
      mensaje: "",
      datoSeleccionado: null,
      lugarAnterior: null,
      datosCopiados: null
    };
  },
  created() {
    //this.estado = this.link[0];
    fs.readdirSync(this.link.join("/")).forEach((e, i) => {
      this.datos[i] = {};
      this.datos[i].nombre = e;
      if (fs.statSync(this.link.join("/") + "/" + e).isDirectory()) {
        this.datos[i].tipo = "Directorio";
      } else {
        this.datos[i].tipo = "Archivo";
      }
      this.datos[i].size = fs.statSync(this.link.join("/") + "/" + e).size;
      this.datos[i].fecha = fs
        .statSync(this.link.join("/") + "/" + e)
        .ctime.toString();
      //console.log(e);
      //console.log(fs.statSync(this.link.join("/") + "/" + e).ctime);
    });
    // console.log(this.datos);
  },
  watch: {
    link() {
      this.datos = [];
      fs.readdirSync(this.link.join("/")).forEach((e, i) => {
        this.datos[i] = {};
        this.datos[i].nombre = e;
        if (fs.statSync(this.link.join("/") + "/" + e).isDirectory()) {
          this.datos[i].tipo = "Directorio";
        } else {
          this.datos[i].tipo = "Archivo";
        }
        this.datos[i].size = fs.statSync(this.link.join("/") + "/" + e).size;
        this.datos[i].fecha = fs
          .statSync(this.link.join("/") + "/" + e)
          .atime.toString();
      });
      console.log(this.datos);
      console.log(this.link);
    }
  },
  methods: {
    buscar() {
      var encontraro = false;
      if (this.formBusqueda != null) {
        /* Hacer la busqueda */
        var buscar = this.formBusqueda;
        for (i in this.datos) {
          if (buscar == this.datos[i].nombre) {
            if (this.datos[i].tipo == "Directorio") {
              this.link.push(this.datos[i].nombre);
              this.estado.push(this.datos[i].nombre);
              this.formBusqueda = null;
              encontraro = true;
            } else {
              encontraro = true;
              electron.shell.openItem(
                ruta.join(this.link.join("/"), this.datos[i].nombre)
              );
            }
          }
        }
        if (!encontraro) {
          alert("Error! \n" + "No se encontraron resultados");
        }
      }
    },
    clickRow(index) {
      this.formBusqueda = null;
      if (index.tipo != "Archivo") {
        this.button = false;
        this.link.push(index.nombre);
        this.estado.push(index.nombre);
      } else {
        electron.shell.openItem(ruta.join(this.link.join("/"), index.nombre));
      }
    },
    backPage() {
      if (this.link.length > 1) {
        this.anterior = this.link;
        this.link.pop();
        this.estado.pop();
      }
    },
    up() {
      this.estado = ["Raiz"];
      this.datos = [];
      this.link = ["/Users/franj/Proyectos"];
    },
    recargar() {
      this.formBusqueda = null;
      let x = this.link;
      this.link = [];
      this.link = x;
    },
    nuevaCarpeta() {
      if (this.formCarpeta != null) {
        var nombre = this.formCarpeta;
        fs.mkdir(this.link.join("/") + "/" + nombre, err => {
          if (!err) {
            document.getElementById("id01").style.display = "none";
            this.recargar();
            this.formCarpeta = null;
          } else {
            alert("Error! \n" + "Error");
          }
        });
      } else {
        document.getElementById("id01").style.display = "none";
      }
    },
    nuevoArchivo() {
      if (this.formArchivo != null) {
        var nombre = this.formArchivo;
        //funcion para ver si existe el archivo con ese nomre
        fs.open(this.link.join("/") + "/" + nombre, (err, fd) => {
          if (err) {
            //no existe
            fs.writeFile(this.link.join("/") + "/" + nombre, "", err => {});
            document.getElementById("id02").style.display = "none"; //oculta modal
            this.recargar(); //recarga
            this.formArchivo = null; //campo de texto volver a nulo
            console.log(this.link);
          } else {
            // alert("Error! \n" + "Nombre en uso");
            document.getElementById("id02").style.display = "none";
            this.formArchivo = null;
          }
        });
      } else {
        document.getElementById("id02").style.display = "none";
      }
    },
    cancelar() {
      document.getElementById("id01").style.display = "none";
      document.getElementById("id02").style.display = "none";
      document.getElementById("id03").style.display = "none";
      this.formArchivo = null;
      this.formCarpeta = null;
      this.mensaje = "";
      this.datoSeleccionado = null;
      this.formCambiarNombre = null;
    },
    opciones(item) {
      console.log(item);
      document.getElementById("id03").style.display = "block";
      this.datoSeleccionado = item;
    },
    eliminar() {
      if (this.datoSeleccionado != null) {
        var tipo = this.datoSeleccionado.tipo;
        var nombre = this.datoSeleccionado.nombre;
        if (tipo == "Directorio") {
          //elimiar tipo carpeta
          fsxtra.remove(this.link.join("/") + "/" + nombre, err => {
            if (!err) {
              this.recargar();
              document.getElementById("id03").style.display = "none";
            } else {
              alert("Error! \n" + "Error");
            }
          });
        } else {
          //eliminar tipo archivo
          try {
            fs.unlinkSync(this.link.join("/") + "/" + nombre);
            this.recargar();
            document.getElementById("id03").style.display = "none";
          } catch (err) {
            // handle the error
            console.log(err);
            alert("Error! \n" + "Error");
          }
        }
      } else {
        alert("Error! \n" + "Error");
      }
    },
    cambiarNombre() {
      if (
        this.formCambiarNombre != null &&
        this.datoSeleccionado.nombre != null
      ) {
        var nombreAnterior = this.datoSeleccionado.nombre;
        var nuevoNombre = this.formCambiarNombre;
        fs.rename(
          this.link.join("/") + "/" + nombreAnterior,
          this.link.join("/") + "/" + nuevoNombre,
          err => {
            if (!err) {
              this.formCambiarNombre = null;
              this.recargar();
              document.getElementById("id03").style.display = "none";
            } else {
              alert("Error! \n" + "Nombre ya utilizado");
              this.formCambiarNombre = null;
            }
          }
        );
      } else {
        this.formCambiarNombre = null;
        document.getElementById("id03").style.display = "none";
      }
    },
    copiar() {
      if (this.datoSeleccionado != null) {
        var tipo = this.datoSeleccionado.tipo;
        var nombre = this.datoSeleccionado.nombre;
        if (tipo == "Directorio") {
          this.lugarAnterior = this.link.join("/") + "/" + nombre;
        } else {
          this.lugarAnterior = this.link.join("/") + "/" + nombre;
        }
      }
      document.getElementById("id03").style.display = "none";
      document.getElementById("pegar").style.display = "inline";
    },
    pegar() {
      if (this.datoSeleccionado != null) {
        var nombre = this.datoSeleccionado.nombre;
        var lugarAnterior = this.lugarAnterior;
        fsxtra.copy(lugarAnterior, this.link.join("/") + "/" + nombre, err => {
          if (!err) {
            this.recargar();
            document.getElementById("pegar").style.display = "none";
            this.datoSeleccionado = null;
            this.lugarAnterior = null;
          } else {
            console.log(err);
            document.getElementById("pegar").style.display = "none";
            this.datoSeleccionado = null;
            this.lugarAnterior = null;
            alert(
              "Error! \n" +
                "La carpeta de destino es una subcarpeta de la carpeta de origen"
            );
          }
        });
      }
    }
  }
});
