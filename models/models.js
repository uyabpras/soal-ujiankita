module.exports = (sequelize, DataTypes) => {
    const Soal = sequelize.define("soal", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        mata_pelajaran: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        kategori:{
            type: DataTypes.STRING,
        },
        deskripsi_soal1:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        deskripsi_soal2:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        multipel1:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        multipel2:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        multipel3:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        multipel4:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        multipel5:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        correct_answer:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        description_answer:{
            type: DataTypes.STRING,
        }
    });

    return Soal
};