/* Variables globales de libreria NODE JS para la administracio nde archivos */
var fs = require("fs");
var electron = require("electron");
var ruta = require("path");
var fsxtra = require("fs-extra");

var App = new Vue({
  el: "#app",
  data() {
    return {
      estado: ["Raiz"],
      datos: [],
      ruta: ["/Users/franj/Proyectos/Pruebas"],
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
    /* Funcion que sol ose ejecuta una ves cuando inicia el programa */
    fs.readdirSync(this.ruta.join("/")).forEach((e, i) => {
      //for que recorre los archivos de la ruta especificada
      this.datos[i] = {}; //en varaible global datos que es la que se meustra en el programa se agregan los datos que encontro en el for
      this.datos[i].nombre = e;
      if (fs.statSync(this.ruta.join("/") + "/" + e).isDirectory()) {
        this.datos[i].tipo = "Directorio";
      } else {
        this.datos[i].tipo = "Archivo";
      }
      this.datos[i].size = fs.statSync(this.ruta.join("/") + "/" + e).size;
      this.datos[i].fecha = fs
        .statSync(this.ruta.join("/") + "/" + e)
        .ctime.toString();
      //console.log(e);
      //console.log(fs.statSync(this.ruta.join("/") + "/" + e).ctime);
    });
    // console.log(this.datos);
  },
  watch: {
    //funciones que cambian en tiempo real
    ruta() {
      //variblae globar que camvbia en tiempo real cuando es utilizada
      this.datos = []; //inicializa arreglo datos
      fs.readdirSync(this.ruta.join("/")).forEach((e, i) => {
        //funcion que busca todos los archivos en la pc
        this.datos[i] = {}; //conmvierte en JSON cada resultado
        this.datos[i].nombre = e; //agrega nombre
        if (fs.statSync(this.ruta.join("/") + "/" + e).isDirectory()) {
          //funcion que identifica si es carpeta o no
          this.datos[i].tipo = "Directorio";
        } else {
          this.datos[i].tipo = "Archivo";
        }
        this.datos[i].size = fs.statSync(this.ruta.join("/") + "/" + e).size; //agrega tamaño del archivo o carpeta
        this.datos[i].fecha = fs //fecha en que fue creado
          .statSync(this.ruta.join("/") + "/" + e)
          .atime.toString(); //convierte resultado en tipoString para poder visualizarce
      });
    }
  },
  methods: {
    buscar() {
      //funcion para buscar en campo busqueda
      var encontraro = false; //variable para identificar si fue encontrado o no
      if (this.formBusqueda != null) {
        //si el campo de texto tiene texto
        /* Hacer la busqueda */
        var buscar = this.formBusqueda; // texto en campo texto
        for (i in this.datos) {
          //for que recorre arreglo de datos
          if (buscar == this.datos[i].nombre) {
            //si lo que busca esta en los datos
            if (this.datos[i].tipo == "Directorio") {
              //si es directorio abre el directorio
              this.ruta.push(this.datos[i].nombre);
              this.estado.push(this.datos[i].nombre);
              this.formBusqueda = null;
              encontraro = true;
            } else {
              //si es archivo lo abre
              encontraro = true;
              electron.shell.openItem(
                ruta.join(this.ruta.join("/"), this.datos[i].nombre)
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
      this.formBusqueda = null; //elimina si hay datos en campo texto
      if (index.tipo != "Archivo") {
        //si es carpeta
        this.button = false;
        this.ruta.push(index.nombre);
        this.estado.push(index.nombre);
      } else {
        //si es archivo
        electron.shell.openItem(ruta.join(this.ruta.join("/"), index.nombre));
      }
    },
    backPage() {
      //rompe la pila y muestra los datos anteriores
      if (this.ruta.length > 1) {
        this.anterior = this.ruta;
        this.ruta.pop();
        this.estado.pop();
      }
    },
    up() {
      //lleva a la carpeta raiz
      this.estado = ["Raiz"];
      this.datos = [];
      this.ruta = ["/Users/franj/Proyectos"];
    },
    recargar() {
      //vuelve a recargar los datos
      this.formBusqueda = null;
      let x = this.ruta;
      this.ruta = [];
      this.ruta = x;
    },
    nuevaCarpeta() {
      if (this.formCarpeta != null) {
        //si el campo del nombre carpeta no esta vacio
        var nombre = this.formCarpeta; //texto del campo nombre carpeta
        fs.mkdir(this.ruta.join("/") + "/" + nombre, err => {
          //funcion que crea carpeta
          if (!err) {
            //si no hay error
            document.getElementById("id01").style.display = "none";
            this.recargar();
            this.formCarpeta = null;
          } else {
            //si hay error
            alert("Error! \n" + "Error");
          }
        });
      } else {
        //si el campo de texto esta vacio
        document.getElementById("id01").style.display = "none";
      }
    },
    nuevoArchivo() {
      if (this.formArchivo != null) {
        //si el campo de texto no esta vacio
        var nombre = this.formArchivo;
        //funcion para ver si existe el archivo con ese nomre
        fs.open(this.ruta.join("/") + "/" + nombre, (err, fd) => {
          if (err) {
            //no existe
            fs.writeFile(this.ruta.join("/") + "/" + nombre, "", err => {});
            document.getElementById("id02").style.display = "none"; //oculta modal
            this.recargar(); //recarga
            this.formArchivo = null; //campo de texto volver a nulo
            console.log(this.ruta);
          } else {
            // alert("Error! \n" + "Nombre en uso");
            document.getElementById("id02").style.display = "none";
            this.formArchivo = null;
          }
        });
      } else {
        // si el campo de texto esta vacio
        document.getElementById("id02").style.display = "none";
      }
    },
    cancelar() {
      //funcuion global que cancela todos y cierra los modales y borra las variables de textos
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
      //habre modal opciones
      document.getElementById("id03").style.display = "block";
      this.datoSeleccionado = item; //agrega los datos que seleccion a la variable global
    },
    eliminar() {
      if (this.datoSeleccionado != null) {
        //si hay un dato seleccionado
        var tipo = this.datoSeleccionado.tipo; //tipo del dato seleccionado
        var nombre = this.datoSeleccionado.nombre; //nombre del dato
        if (tipo == "Directorio") {
          //elimiar tipo carpeta
          fsxtra.remove(this.ruta.join("/") + "/" + nombre, err => {
            //funcion para eliminar carpetas
            if (!err) {
              this.recargar(); //recarga la pagina
              document.getElementById("id03").style.display = "none"; //cierra modl
            } else {
              /* Error de algun tipo */
              alert("Error! \n" + "Error");
            }
          });
        } else {
          //eliminar tipo archivo
          try {
            fs.unrutaSync(this.ruta.join("/") + "/" + nombre); //funcion para eliminar archivos
            this.recargar(); //recarga pagina
            document.getElementById("id03").style.display = "none";
          } catch (err) {
            // algun tipo de error
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
        // si el campo de cambiar nombre no esta vacio
        var nombreAnterior = this.datoSeleccionado.nombre; //nombre anterio
        var nuevoNombre = this.formCambiarNombre; //nuevo nombre
        //funcion para renombrrar
        fs.rename(
          this.ruta.join("/") + "/" + nombreAnterior,
          this.ruta.join("/") + "/" + nuevoNombre,
          err => {
            if (!err) {
              this.formCambiarNombre = null;
              this.recargar(); //recargar pagina
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
        //si hay un archivo seleccionado
        var nombre = this.datoSeleccionado.nombre; //toma el nombre del dato que selecciono
        //agrega la ruta del dato seleccionado para guardar globalmente cual archivo o carpeta sera modificado
        this.lugarAnterior = this.ruta.join("/") + "/" + nombre;
      }
      document.getElementById("id03").style.display = "none";
      document.getElementById("pegar").style.display = "inline";
    },
    pegar() {
      if (this.datoSeleccionado != null) {
        //si hay un archivo seleccionado
        var nombre = this.datoSeleccionado.nombre;
        var lugarAnterior = this.lugarAnterior;
        fsxtra.copy(lugarAnterior, this.ruta.join("/") + "/" + nombre, err => {
          //funcion para copiar
          if (!err) {
            this.recargar(); //recarga pagina
            document.getElementById("pegar").style.display = "none"; //quita modal
            //inicializa variables globales
            this.datoSeleccionado = null;
            this.lugarAnterior = null;
          } else {
            //si hay errores
            console.log(err);
            document.getElementById("pegar").style.display = "none";
            //inicializa variables globales
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
