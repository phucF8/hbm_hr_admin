using LinqToDB;
using LinqToDB.Data;
using HBM_HR_Admin_Angular2.Server.Models;
using LinqToDB;
using LinqToDB.Data;
using LinqToDB.Mapping;






namespace HBM_HR_Admin_Angular2.Server.Data {
    public class AppDataConnection : DataConnection {

        public AppDataConnection(string connectionString)
        : base(connectionString) { }

        public AppDataConnection(IConfiguration config)
            : base(config.GetConnectionString("DefaultConnection")) { }



        // Mapping bảng 
        public ITable<GY_GopY> GopYs => this.GetTable<GY_GopY>();
        public ITable<GY_PhanHoi> PhanHois => this.GetTable<GY_PhanHoi>();
        public ITable<NS_NhanVien> NhanViens => this.GetTable<NS_NhanVien>();

    }
}
