import React from 'react';
import UserList from './UserList';
import UserSearch from './UserSearch';  // 그대로 사용
import styles from '../css/AdminSidebar.module.css';

const AdminSidebar = ({
  users,
  onSelectUser,
  onDeleteUser,
  searchType,
  searchText,
  onSearchType,
  onSearchText
}) => {
  return (
    <aside className={styles.sidebar}>
      {/* 검색 바: 검색 버튼 제거 */}
      <UserSearch
        searchType={searchType}
        searchText={searchText}
        onSearchType={onSearchType}
        onSearchText={onSearchText}
        // 🔴 onSearch prop 제거 또는 무시됨
      />

      {/* 사용자 리스트 */}
      <UserList
        users={users}
        onSelectUser={onSelectUser}
        onDeleteUser={onDeleteUser}
      />
    </aside>
  );
};

export default AdminSidebar;


// 검색 버튼 존재
// import React from 'react';
// import UserList from './UserList';
// import UserSearch from './UserSearch';  // 검색 UI 컴포넌트
// import styles from '../css/AdminSidebar.module.css';

// const AdminSidebar = ({
//   users,
//   onSelectUser,
//   onDeleteUser,
//   searchType,
//   searchText,
//   onSearchType,
//   onSearchText,
//   onSearch
// }) => {
//   return (
//     <aside className={styles.sidebar}>
//       {/* 검색 바 */}
//       <UserSearch
//         searchType={searchType}
//         searchText={searchText}
//         onSearchType={onSearchType}
//         onSearchText={onSearchText}
//         onSearch={onSearch}
//       />

//       {/* 사용자 리스트 */}
//       <UserList
//         users={users}
//         onSelectUser={onSelectUser}
//         onDeleteUser={onDeleteUser}
//       />
//     </aside>
//   );
// };

// export default AdminSidebar;


//  기존
// import React from 'react';
// import UserList from './UserList.jsx';
// import UserSearch from './UserSearch.jsx';
// import styles from '../css/AdminSidebar.module.css';

// const AdminSidebar = ({
//     users,
//     onSelectUser,
//     onDeleteUser,
//     searchType,
//     searchText,
//     onSearchType,
//     onSearchText,
//     onSearch
// }) => {
//     return (
//         <aside className={styles.sidebar}>
//             {/* 검색 바 컴포넌트 */}
//             <UserSearch
//                 searchType={searchType}
//                 searchText={searchText}
//                 onSearchType={onSearchType}
//                 onSearchText={onSearchText}
//                 onSearch={onSearch}
//             />

//             {/* 사용자 리스트 컴포넌트 */}
//             <UserList
//                 users={users}
//                 onSelectUser={onSelectUser}
//                 onDeleteUser={onDeleteUser}
//             />
//         </aside>
//     );
// };

// export default AdminSidebar;




// import React from 'react';
// import UserList from './UserList.jsx';
// import UserSearch from './UserSearch.jsx';
// import styles from '../css/AdminSidebar.module.css';

// const AdminSidebar = ({
//     users,
//     onSelectUser,
//     onDeleteUser,
//     searchType,
//     searchText,
//     onSearchType,
//     onSearchText,
//     onSearch
// }) => {
//     return (
//         <aside className={styles.sidebar}>
//             <UserSearch
//                 searchType={searchType}
//                 searchText={searchText}
//                 onSearchType={onSearchType}
//                 onSearchText={onSearchText}
//                 onSearch={onSearch}
//             />
//             <UserList
//                 users={users}
//                 onSelectUser={onSelectUser}
//                 onDeleteUser={onDeleteUser}
//             />
//         </aside>
//     );
// };

// export default AdminSidebar; 